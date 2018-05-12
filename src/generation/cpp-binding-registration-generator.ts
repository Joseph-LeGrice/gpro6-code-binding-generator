import { GeneratedType } from "../config/argument-binding";
import { BindingConfiguration, FileBinding, MethodBinding } from "../config/binding-config";
import { Generator, SingleFileGenerator, GeneratorUtil } from "./code-generator";
import * as fs from 'fs-extra'
import * as path from 'path'

export class CppBindingHeaderGenerator extends SingleFileGenerator
{
    protected getFileName(): string {
        return path.join(this.config.outputCppDirectory, `${this.config.namespace}BindingRegistration.h`);
    }

    protected generateFileSkeleton(): string {
        const result: Array<string> = new Array<string>();
        result.push(`#pragma once\n`);
        
        result.push(`namespace ${this.config.namespace}`);
        result.push(`{`);
        result.push(GeneratorUtil.delimiter);
        result.push(GeneratorUtil.delimiter);
        result.push(`};`);
        
        return result.join('\n');
    }

    protected appendMethodInfo(fileText: string): string {
        let result = GeneratorUtil.clear(fileText);
        result = GeneratorUtil.insert(`\textern void RegisterAllCalls();`, result);
        return result;
    }
}

export class CppBindingSourceGenerator extends SingleFileGenerator
{
    public async generate(): Promise<void>
    {
        const result: Array<string> = new Array<string>();
        result.push(`#include "stdafx.h"`);
        result.push(`#include "${this.config.namespace}BindingRegistration.h"`);
        for (const file of this.config.fileBindings)
        {
            if(file.subdirectory) {
                result.push(`#include "${file.subdirectory}/${file.name}API.h"`);
            } else {
                result.push(`#include "${file.name}API.h"`);                
            }
        }

        result.push(`\nusing namespace ${this.config.namespace};\n`);

        result.push(`void ${this.config.namespace}::RegisterAllCalls()`);
        result.push(`{`);
        for (const file of this.config.fileBindings)
        {
            result.push(`\t${file.name}API::RegisterCalls();`);
        }
        result.push(`}`);        
        
        const resultText = result.join('\n');
        const filePath = path.join(this.config.outputCppDirectory, `${this.config.namespace}BindingRegistration.cpp`);
        return fs.writeFile(filePath, resultText);
    }


    
    protected getFileName(): string {
        return path.join(this.config.outputCppDirectory, `${this.config.namespace}BindingRegistration.h`);
    }

    protected generateFileSkeleton(): string {
        const result: Array<string> = new Array<string>();
        result.push(`#include "stdafx.h"`);
        
        result.push(GeneratorUtil.delimiter);
        result.push(GeneratorUtil.delimiter);
        
        return result.join('\n');
    }

    protected appendMethodInfo(fileText: string): string {
        let result = GeneratorUtil.clear(fileText);
        result = GeneratorUtil.insert(this.headerIncludes(), result);
        result = GeneratorUtil.insert(this.registerAllCalls(), result);
        return result;
    }

    private headerIncludes(): string {
        const result = new Array<string>();
        result.push(`#include "${this.config.namespace}BindingRegistration.h"`);
        for (const file of this.config.fileBindings)
        {
            if(file.subdirectory) {
                result.push(`#include "${file.subdirectory}/${file.name}API.h"`);
            } else {
                result.push(`#include "${file.name}API.h"`);                
            }
        }
        result.push(`\nusing namespace ${this.config.namespace};\n`);
        return result.join('\n');
    }

    private registerAllCalls() {
        const result = new Array<string>();
        result.push(`void ${this.config.namespace}::RegisterAllCalls()`);
        result.push(`{`);
        for (const file of this.config.fileBindings)
        {
            result.push(`\t${file.name}API::RegisterCalls();`);
        }
        result.push(`}`);
        return result.join('\n');        
    }
}