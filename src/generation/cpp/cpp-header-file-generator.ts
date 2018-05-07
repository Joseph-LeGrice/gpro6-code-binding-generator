import { FileBinding } from "../../config/file-binding";
import { GeneratedType } from "../../config/argument-binding";
import { MethodBinding } from "../../config/method-binding";
import { BatchFileGenerator } from "./code-generator";
import * as path from "path";

export class CppHeaderGenerator extends BatchFileGenerator
{
    protected generateFile(file: FileBinding): string
    {
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
        result.push(`\t\textern void RegisterCalls();`);
        result.push(`${this.generateMethodDefinitions(file)}`);
        result.push(`\t};`);
        result.push(`};`);
        return result.join('\n');
    }

    protected getFileName(file: FileBinding) {
        return path.join(this.config.outputCppDirectory, `${file.name}API.h`);
    }

    private generateMethodDefinitions(file: FileBinding): string
    {
        const result: Array<string> = new Array<string>();
        for (const m of file.allMethods)
        {
            if (m.type === 'instance')
            {
                result.push(this.instanceMethodDefinition(m));
            }
            else if (m.type === 'static')
            {
                result.push(this.staticMethodDefinition(m));
            }
        }        
        return result.join('\n');
    }

    private instanceMethodDefinition(method: MethodBinding): string
    {
        return `\t\textern ${method.returnType(GeneratedType.cpp)} ${method.name}(int managedInstanceId, ${method.getArgDefinitions(GeneratedType.cpp)});`
    }

    private staticMethodDefinition(method: MethodBinding): string
    {
        return `\t\textern ${method.returnType(GeneratedType.cpp)} ${method.name}(${method.getArgDefinitions(GeneratedType.cpp)});`
    }
}