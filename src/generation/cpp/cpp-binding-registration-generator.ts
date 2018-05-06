import { FileBinding } from "../../config/file-binding";
import { GeneratedType } from "../../config/argument-binding";
import { MethodBinding } from "../../config/method-binding";
import { BindingCongfiguration } from "../../config/binding-configuration";
import { Generator } from "./code-generator";
import * as fs from 'fs-extra'
import * as path from 'path'

export class CppBindingHeaderGenerator extends Generator
{
    public async generate(): Promise<void>
    {
        const result: Array<string> = new Array<string>();
        result.push(`#pragma once\n`);
        
        result.push(`namespace ${this.config.namespace}`);
        result.push(`{`);
        result.push(`\tvoid RegisterAllCalls();`);
        result.push(`};`);
        
        const resultText = result.join('\n');
        const filePath = path.join(this.config.outputCppDirectory, `${this.config.namespace}BindingRegistration.h`);
        return fs.writeFile(filePath, resultText);
    }
}

export class CppBindingSourceGenerator extends Generator
{
    public async generate(): Promise<void>
    {
        const result: Array<string> = new Array<string>();
        result.push(`#include "stdafx.h"`);
        result.push(`#include "${this.config.namespace}BindingRegistration.h"`);
        for (const file of this.config.fileBindings)
        {
            result.push(`#include "${file.fileName(GeneratedType.cpp)}.h"`);
        }

        result.push(`\nvoid ${this.config.namespace}::RegisterAllCalls()`);
        result.push(`{`);
        for (const file of this.config.fileBindings)
        {
            result.push(`\t${file.fileName(GeneratedType.cpp)}::RegisterCalls();`);
        }
        result.push(`}`);        
        
        const resultText = result.join('\n');
        const filePath = path.join(this.config.outputCppDirectory, `${this.config.namespace}BindingRegistration.cpp`);
        return fs.writeFile(filePath, resultText);
    }
}