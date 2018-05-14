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
        if (file.includePath) {
            result.push(`#include "${file.includePath}"\n`);
        }
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
        result.push(`void ${this.config.namespace}::${file.name}API::RegisterCalls()`);
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
        let args: string[] = [];
        for (let i=0; i < method.args.length; i++) {
            const arg = method.args[i];
            args.push(`${MethodBindingHelpers.getArgument(arg, GeneratedType.cs)}`);
        }
        if (args.length > 0) {
            return `\tmono_add_internal_call("${file.name}::${method.name}(int,${args.join(',')})", ${this.config.namespace}::${file.name}API::${method.name});`
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
            result.push(`\tmono_add_internal_call("${file.name}::${this.propertyGetterMethodName(prop)}", ${this.config.namespace}::${file.name}API::${this.propertyGetterMethodName(prop)}`);
        }
        if (prop.setter) {
            result.push(`\tmono_add_internal_call("${file.name}::${this.propertySetterMethodName(prop)}", ${this.config.namespace}::${file.name}API::${this.propertySetterMethodName(prop)}`);
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
            return `${MethodBindingHelpers.returnType(methodConfig, GeneratedType.cpp)} ${this.config.namespace}::${file.name}API::${methodConfig.name}(int managedInstanceId, ${MethodBindingHelpers.getArgDefinitions(methodConfig, GeneratedType.cpp)})`;
        } else {
            return `${MethodBindingHelpers.returnType(methodConfig, GeneratedType.cpp)} ${this.config.namespace}::${file.name}API::${methodConfig.name}(int managedInstanceId)`;
        }
    }

    private getMarshalledArgs(methodConfig: MethodBinding): string | undefined {
        const result = new Array<string>();
        for (let i=0; i<methodConfig.args.length; i++) {
            const arg = methodConfig.args[i];
            const marshallInfo = MethodBindingHelpers.getMarshall(arg);
            if (marshallInfo) {
                result.push(`\t${marshallInfo.toType} arg${i}_marshalled = ${marshallInfo.withMethod}(arg${i});`);
            }
        }
        if (result.length > 0) {
            return result.join('\n');
        } else {
            return undefined;
        }
    }

    private getNativeInstance(file: FileBinding): string {
        const result = new Array<string>();
        result.push(`\tTypedObjectManager* tom = GlobalStaticReferences::Instance()->GetTypedObjectManager();`);
        result.push(`\t${file.name}* nativeClassInstance = tom->GetInstance<${file.name}>(managedInstanceId);`);
        return result.join('\n');
    }
    
    private getCall(methodConfig: MethodBinding): string {
        const result = new Array<string>();
        result.push('\t');
        if (methodConfig.returnType !== 'void') {
            result.push('return ');
        }
        result.push(`nativeClassInstance->${methodConfig.name}(${MethodBindingHelpers.getArgUses(methodConfig, GeneratedType.cpp)});`);
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
            result.push(this.propertyGetterImpl(file, prop));
        }
        if (prop.setter) {
            result.push(this.propertySetterImpl(file, prop));
        }
        return result.join('\n');
    }

    private propertyGetterImpl(file: FileBinding, prop: PropertyBinding): string {
        const result = new Array<string>();
        result.push(`${MethodBindingHelpers.returnType(prop, GeneratedType.cpp)} ${this.propertyGetterMethodName(prop)}(int instanceId)`);
        result.push('{');
        result.push(this.getNativeInstance(file));
        result.push(`\treturn nativeClassInstance->${prop.nativeName};`);
        result.push('}');
        return result.join('\n');
    }

    private propertySetterImpl(file: FileBinding, prop: PropertyBinding): string {
        const result = new Array<string>();
        result.push(`void ${this.propertySetterMethodName(prop)}(int instanceId, ${MethodBindingHelpers.returnType(prop, GeneratedType.cpp)} value)`);
        result.push('{');
        result.push(this.getNativeInstance(file));
        result.push(`\tnativeClassInstance->${prop.nativeName} = value;`);
        result.push('}');
        return result.join('\n');
    }
    
    private propertyGetterMethodName(prop: PropertyBinding) {
        return `Get_${prop.name};`;
    }
    
    private propertySetterMethodName(prop: PropertyBinding) {
        return `Set_${prop.name};`;
    }
}