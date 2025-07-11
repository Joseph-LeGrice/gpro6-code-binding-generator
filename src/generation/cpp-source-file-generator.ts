import { GeneratedType } from "../config/argument-binding";
import { FileBinding, MethodBinding, MethodBindingHelpers, PropertyBinding } from "../config/binding-config";
import { BatchFileGenerator, GeneratorUtil } from "./code-generator";
import * as path from 'path'

export class CppSourceGenerator extends BatchFileGenerator
{
    protected generateFileSkeleton(file: FileBinding): string {
        const result: Array<string> = new Array<string>();
        result.push(`#include "stdafx.h"`);
        result.push(`#include "${file.name}API.h"`);
        result.push(`#include "Engine/Core/GlobalStaticReferences.h"`);
        if (file.includePaths) {
            for (const path of file.includePaths) {
                result.push(`#include "${path}"\n`);
            }
        }
        result.push(`#include "Engine/Core/Scripting/NativeToManagedInstanceMap.h"`);
        result.push(`#include "Engine/Core/Scripting/MonoMarshallHelpers.h"`);
        result.push(`#include "Engine/Core/RTTI/TypedObjectManager.h"\n`);
        result.push(GeneratorUtil.delimiter);
        result.push(GeneratorUtil.delimiter);
        return result.join('\n');
    }

    protected appendMethodInfo(file: FileBinding, fileText: string): string {
        let result = GeneratorUtil.clear(fileText);
        result = GeneratorUtil.insert(this.registerCalls(file), result);
        if (file.methods && file.methods.length > 0) {
            result = GeneratorUtil.insert(this.generateMethodImplementations(file), result);
        }
        if (file.properties && file.properties.length > 0) {
            result = GeneratorUtil.insert(this.generatePropertyImplementations(file), result);
        }
        return result;
    }

    protected getFileName(file: FileBinding) {
        return path.resolve(this.config.outputCppDirectory, file.subdirectory, `${file.name}API.cpp`);
    }

    // ## CALL REGISTRATION STUFF ##
    
    private registerCalls(file: FileBinding): string {        
        const result: Array<string> = new Array<string>();
        result.push(`extern void ${this.config.namespace}::${file.name}API::RegisterCalls()`);
        result.push(`{`);
        for (const m of file.methods) {
            if (m.methodType === 'instance') {
                result.push(this.addInstanceMonoCall(file, m));
            } else if (m.methodType === 'static') {
                result.push(this.addStaticMonoCall(file, m));
            }
        }
        for (const p of file.properties) {
            result.push(this.addPropertyMonoCall(file, p));
        }        
        result.push(`}`);
        return result.join('\n');
    }

    private addInstanceMonoCall(file: FileBinding, method: MethodBinding): string {
        let cs_args: string[] = [];
        for (let i=0; i < method.args.length; i++) {
            const arg = method.args[i];
            cs_args.push(`${MethodBindingHelpers.getArgument(arg, GeneratedType.cs_method_descriptor)}`);
        }
        if (cs_args.length > 0) {
            return `\tmono_add_internal_call("${file.name}::${method.name}(int,${cs_args.join(',')})", ${this.config.namespace}::${file.name}API::${method.name});`
        } else {
            return `\tmono_add_internal_call("${file.name}::${method.name}(int)", ${this.config.namespace}::${file.name}API::${method.name});`            
        }
    }

    private addStaticMonoCall(file: FileBinding, method: MethodBinding): string {
        return `\tmono_add_internal_call("${file.name}::${method.name}", ${this.config.namespace}::${file.name}API::${method.name});`
    }
    
    private addPropertyMonoCall(file: FileBinding, prop: PropertyBinding): string {
        const result = new Array<string>();
        if (prop.getter) {
            result.push(`\tmono_add_internal_call("${file.name}::${this.propertyGetterMethodName(prop)}", ${this.config.namespace}::${file.name}API::${this.propertyGetterMethodName(prop)});`);
        }
        if (prop.setter) {
            result.push(`\tmono_add_internal_call("${file.name}::${this.propertySetterMethodName(prop)}", ${this.config.namespace}::${file.name}API::${this.propertySetterMethodName(prop)});`);
        }
        return result.join('\n');
    }

    // ## METHOD STUFF ##    

    private generateMethodImplementations(config: FileBinding): string {
        const methods: string[] = [];
        for (let i=0; i<config.methods.length; i++) {
            const m = config.methods[i];
            if (m.methodType === 'instance') {
                if (i < config.methods.length - 1) {
                    methods.push(`${this.instanceMethod(config, m)}\n`);
                } else {
                    methods.push(this.instanceMethod(config, m));                    
                }
            }
        }
        return methods.join('\n');
    }

    private instanceMethod(file: FileBinding, methodConfig: MethodBinding): string {
        const result: Array<string> = new Array<string>();
        result.push(this.methodSignature(file, methodConfig));
        result.push(`{`);
        const marshalledArgs = this.getMarshalledArgs(methodConfig);
        if (marshalledArgs) {
            result.push(marshalledArgs);
        }
        result.push(this.getNativeInstance(file));
        result.push(this.getCall(methodConfig));
        result.push(`}`);
        return result.join('\n');
    }

    private methodSignature(file: FileBinding, methodConfig: MethodBinding) {
        let args = MethodBindingHelpers.getArgDefinitions(methodConfig, GeneratedType.cpp);
        if (args.length > 0) {
            return `extern ${MethodBindingHelpers.returnType(methodConfig, GeneratedType.cpp)} ${this.config.namespace}::${file.name}API::${methodConfig.name}(InstanceID managedInstanceId, ${MethodBindingHelpers.getArgDefinitions(methodConfig, GeneratedType.cpp)})`;
        } else {
            return `extern ${MethodBindingHelpers.returnType(methodConfig, GeneratedType.cpp)} ${this.config.namespace}::${file.name}API::${methodConfig.name}(InstanceID managedInstanceId)`;
        }
    }

    private getMarshalledArgs(methodConfig: MethodBinding): string | undefined {
        const result = new Array<string>();
        for (let i=0; i<methodConfig.args.length; i++) {
            const arg = methodConfig.args[i];
            const marshallInfo = MethodBindingHelpers.getMarshall(arg);
            if (marshallInfo) {
                result.push(`\t${marshallInfo.toType} arg${i}_marshalled = ${marshallInfo.toNativeMethod}(arg${i});`);
            }
        }
        if (result.length > 0) {
            return result.join('\n');
        } else {
            return undefined;
        }
    }

    private getNativeInstance(file: FileBinding): string {
        return `\t${file.name}* nativeClassInstance = MonoMarshall::GetNativeObject<${file.name}>(managedInstanceId);`
    }
    
    private getCall(methodConfig: MethodBinding): string {
        const result = new Array<string>();
        result.push('\t');
        if (methodConfig.returnType !== 'void') {
            result.push('return ');
        }

        const marshallInfo = MethodBindingHelpers.getMarshall(methodConfig.returnType);
        if (marshallInfo) {
            result.push(`${marshallInfo.toManagedMethod}(`);
        }
        result.push(`nativeClassInstance->${methodConfig.name}(${MethodBindingHelpers.getArgUses(methodConfig, GeneratedType.cpp)})`);
        if (marshallInfo) {
            result.push(')');
        }
        result.push(';');
        return result.join('');
    }

    // ## PROPERTY STUFF ##

    private generatePropertyImplementations(file: FileBinding): string {
        const result = new Array<string>();
        for (const p of file.properties) {
            result.push(this.property(file, p));
        }
        return result.join('\n');
    }

    private property(file: FileBinding, prop: PropertyBinding): string {
        const result = new Array<string>();
        if (prop.getter) {
            result.push(`${this.propertyGetterImpl(file, prop)}\n`);
        }
        if (prop.setter) {
            result.push(`${this.propertySetterImpl(file, prop)}\n`);
        }
        return result.join('\n');
    }

    private propertyGetterImpl(file: FileBinding, prop: PropertyBinding): string {
        const result = new Array<string>();
        result.push(`extern ${MethodBindingHelpers.returnType(prop, GeneratedType.cpp)} GPro::${file.name}API::${this.propertyGetterMethodName(prop)}(InstanceID managedInstanceId)`);
        result.push('{');
        result.push(this.getNativeInstance(file));
        const marshallInfo = MethodBindingHelpers.getMarshall(prop.returnType);
        if (marshallInfo) {
            result.push(`\treturn ${marshallInfo.toManagedMethod}(nativeClassInstance->${prop.nativeName});`);
        } else {
            result.push(`\treturn nativeClassInstance->${prop.nativeName};`);            
        }
        result.push('}');
        return result.join('\n');
    }

    private propertySetterImpl(file: FileBinding, prop: PropertyBinding): string {
        const result = new Array<string>();
        result.push(`extern void GPro::${file.name}API::${this.propertySetterMethodName(prop)}(InstanceID managedInstanceId, ${MethodBindingHelpers.returnType(prop, GeneratedType.cpp)} value)`);
        result.push('{');
        result.push(this.getNativeInstance(file));
        const marshallInfo = MethodBindingHelpers.getMarshall(prop.returnType);
        if (marshallInfo) {
            result.push(`\tnativeClassInstance->${prop.nativeName} = ${marshallInfo.toNativeMethod}(value);`);
        } else {
            result.push(`\tnativeClassInstance->${prop.nativeName} = value;`);            
        }
        result.push('}');
        return result.join('\n');
    }
    
    private propertyGetterMethodName(prop: PropertyBinding) {
        return `Get_${prop.name}`;
    }
    
    private propertySetterMethodName(prop: PropertyBinding) {
        return `Set_${prop.name}`;
    }
}