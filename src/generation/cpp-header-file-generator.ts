import { GeneratedType } from "../config/argument-binding";
import { FileBinding, MethodBinding, MethodBindingHelpers } from "../config/binding-config";
import { BatchFileGenerator, GeneratorUtil } from "./code-generator";
import * as path from "path";

export class CppHeaderGenerator extends BatchFileGenerator
{
    protected generateFileSkeleton(file: FileBinding): string {
        const result: Array<string> = new Array<string>();
        result.push(`#pragma once\n`);
        
        result.push(`#pragma warning(push)`);
        result.push(`#pragma warning(disable:4201)`);
        result.push(`#include <mono/metadata/object.h>`);
        result.push(`#pragma warning(pop)\n`);

        result.push(`namespace ${this.config.namespace}`);
        result.push(`{`);
        result.push(`\tnamespace ${file.name}API`);
        result.push(`\t{`);
        result.push(GeneratorUtil.delimiter);
        result.push(GeneratorUtil.delimiter);        
        result.push(`\t};`);
        result.push(`};`);
        return result.join('\n');
    }
    
    protected appendMethodInfo(file: FileBinding, fileText: string): string {
        let result = GeneratorUtil.clear(fileText);
        result = GeneratorUtil.insert(`\t\textern void RegisterCalls();`, result);
        for (const m of file.methods) {
            if (m.methodType === 'instance') {
                result = GeneratorUtil.insert(this.instanceMethodDefinition(m), result);
            } else if (m.methodType === 'static') {
                result = GeneratorUtil.insert(this.staticMethodDefinition(m), result);
            }
        }
        return result;
    }

    protected getFileName(file: FileBinding) {
        return path.resolve(this.config.outputCppDirectory, file.subdirectory, `${file.name}API.h`);
    }

    private instanceMethodDefinition(method: MethodBinding): string {
        let args = MethodBindingHelpers.getArgDefinitions(method, GeneratedType.cpp);
        if (args.length > 0) {
            return `\t\textern ${MethodBindingHelpers.returnType(method, GeneratedType.cpp)} ${method.name}(int managedInstanceId, ${args});`
        } else {
            return `\t\textern ${MethodBindingHelpers.returnType(method, GeneratedType.cpp)} ${method.name}(int managedInstanceId);`            
        }
    }

    private staticMethodDefinition(method: MethodBinding): string {
        return `\t\textern ${MethodBindingHelpers.returnType(method, GeneratedType.cpp)} ${method.name}(${MethodBindingHelpers.getArgDefinitions(method, GeneratedType.cpp)});`
    }
}