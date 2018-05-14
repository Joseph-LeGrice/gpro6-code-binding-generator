import { GeneratedType } from "../config/argument-binding";
import { FileBinding, MethodBinding, MethodBindingHelpers } from "../config/binding-config";
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
        result = GeneratorUtil.insert(this.generateMethodImplementations(file), result);
        return result;
    }

    protected getFileName(file: FileBinding) {
        return path.resolve(this.config.outputCppDirectory, file.subdirectory, `${file.name}API.cpp`);
    }

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
    
    private generateMethodImplementations(config: FileBinding): string {
        const methods: string[] = [];
        for (const m of config.methods) {
            if (m.methodType === 'instance') {
                methods.push(this.instanceMethod(config, m));
            }
        }
        return methods.join('\n\n');
    }

    private instanceMethod(file: FileBinding, methodConfig: MethodBinding): string {
        const result: Array<string> = new Array<string>();
        result.push(this.methodSignature(file, methodConfig));
        result.push(`{`);
        result.push(...this.getMarshalledArgs(methodConfig));
        result.push(`\tTypedObjectManager* tom = GlobalStaticReferences::Instance()->GetTypedObjectManager();`);
        result.push(`\t${file.name}* nativeClassInstance = tom->GetInstance<${file.name}>(managedInstanceId);`);
        result.push(...this.getCall(methodConfig));
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

    private getMarshalledArgs(methodConfig: MethodBinding): Array<string> {
        const result = new Array<string>();
        for (let i=0; i<methodConfig.args.length; i++) {
            const arg = methodConfig.args[i];
            const marshallInfo = MethodBindingHelpers.getMarshall(arg);
            if (marshallInfo) {
                result.push(`\t${marshallInfo.toType} arg${i}_marshalled = ${marshallInfo.withMethod}(arg${i});`);
            }
        }
        return result;
    }

    private getCall(methodConfig: MethodBinding): Array<string> {
        const result = new Array<string>();
        result.push('\t');
        if (methodConfig.returnType !== 'void') {
            result.push('return ');
        }
        result.push(`nativeClassInstance->${methodConfig.name}(${MethodBindingHelpers.getArgUses(methodConfig, GeneratedType.cpp)});`);
        return result;
    }
}