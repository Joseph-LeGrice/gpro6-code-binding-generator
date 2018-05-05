import { FileBinding } from "../../config/file-binding";
import { GeneratedType } from "../../config/argument-binding";
import { MethodBinding } from "../../config/method-binding";
import { BindingCongfiguration } from "../../config/binding-configuration";

export class CppBindingRegistrationGenerator implements ICppGenerator
{
    constructor(private config: BindingCongfiguration) { }

    public generateHeaderFile(): string {
        const result: Array<string> = new Array<string>();
        result.push(`#pragma once\n`);
        
        result.push(`namespace ${this.config.namespace}`);
        result.push(`{`);
        result.push(`\tstatic void RegisterAllCalls();`);
        result.push(`};`);
        return result.join('\n');
    }

    public generateSourceFile(): string {
        const result: Array<string> = new Array<string>();
        result.push(`#include "stdafx.h"`);
        result.push(`#include "${this.config.namespace}BindingRegistration.h"`);
        for (const file of this.config.fileBindings) {
            result.push(`#include "${file}API.h"\n`);
        }

        result.push(`void ${this.config.namespace}::RegisterAllCalls()`);
        result.push(`{`);
        for (const file of this.config.fileBindings) {
            result.push(`${file}API::RegisterCalls();`);
        }
        result.push(`}`);        
        return result.join('\n');
    }
};