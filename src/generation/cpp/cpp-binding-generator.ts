import { FileBinding } from "../../config/file-binding";
import { GeneratedType } from "../../config/argument-binding";
import { MethodBinding } from "../../config/method-binding";

export class CppBindingGenerator implements ICppGenerator
{
    constructor(private config: FileBinding) { }

    public generateHeaderFile(): string {
        const result: Array<string> = new Array<string>();
        result.push(`#pragma once\n`);
        
        result.push(`#pragma warning(push)`);
        result.push(`#pragma warning(disable:4201)`);
        result.push(`#include <mono/metadata/object.h>`);
        result.push(`#pragma warning(pop)\n`);

        result.push(`class ${this.config.className(GeneratedType.cpp)}API`);
        result.push(`{`);
        result.push(`\tstatic void RegisterCalls();`);
        result.push(`${this.generateMethodDefinitions()}`);
        result.push(`};`);
        return result.join('\n');
    }

    private generateMethodDefinitions(): string {
        const result: Array<string> = new Array<string>();
        for (const m of this.config.allMethods) {
            if (m.type === 'instance') {
                result.push(this.instanceMethodDefinition(m));
            } else if (m.type === 'static') {
                result.push(this.staticMethodDefinition(m));
            }
        }        
        return result.join('\n');
    }
    
    private instanceMethodDefinition(methodConfig: MethodBinding): string {
        return `\tstatic ${methodConfig.returnType(GeneratedType.cpp)} ${methodConfig.name}(int managedInstanceId, ${methodConfig.getArgDefinitions(GeneratedType.cpp)});`
    }
    
    private staticMethodDefinition(methodConfig: MethodBinding): string {
        return `\tstatic ${methodConfig.returnType(GeneratedType.cpp)} ${methodConfig.name}(${methodConfig.getArgDefinitions(GeneratedType.cpp)});`
    }
    
    public generateSourceFile(): string {
        const result: Array<string> = new Array<string>();
        result.push(`#include "stdafx.h"`);
        result.push(`#include "${this.config.className(GeneratedType.cpp)}API.h"`);
        result.push(`#include "Engine/Core/GlobalStaticReferences.h"`);
        result.push(`#include "Engine/Core/RTTI/TypedObjectManager.h"`);
        result.push(`#include "${this.config.includePath}"\n`);

        result.push(`${this.registerCalls()}\n`);
        result.push(`${this.generateMethodImplementations()}`);
        return result.join('\n');
    }
    
    private registerCalls(): string {        
        const result: Array<string> = new Array<string>();
        result.push(`void ${this.config.className(GeneratedType.cpp)}API::RegisterCalls()`);
        result.push(`{`);
        for (const m of this.config.allMethods) {
            if (m.type === 'instance') {
                result.push(this.addInstanceMonoCall(m));
            } else if (m.type === 'static') {
                result.push(this.addStaticMonoCall(m));
            }
        }
        result.push(`}`);
        return result.join('\n');
    }

    private addInstanceMonoCall(methodConfig: MethodBinding): string {
        return `\tmono_add_internal_call("${this.config.className(GeneratedType.cs)}::${methodConfig.name}(int managedInstanceId, ${methodConfig.getArgDefinitions(GeneratedType.cs)})", ${this.config.className(GeneratedType.cpp)}API::${methodConfig.name});`
    }
    
    private addStaticMonoCall(methodConfig: MethodBinding): string {
        return `\tmono_add_internal_call("${this.config.className(GeneratedType.cs)}::${methodConfig.name}", ${this.config.className(GeneratedType.cpp)}API::${methodConfig.name});`
    }

    private generateMethodImplementations(): string {
        const methods: string[] = [];
        for (const m of this.config.allMethods) {
            if (m.type === 'instance') {
                methods.push(this.instanceMethod(m));
            }
        }
        return methods.join('\n\n');
    }

    private instanceMethod(methodConfig: MethodBinding): string {
        const result: Array<string> = new Array<string>();
        result.push(`${methodConfig.returnType(GeneratedType.cpp)} ${this.config.className(GeneratedType.cpp)}API::${methodConfig.name}(int managedInstanceId, ${methodConfig.getArgDefinitions(GeneratedType.cpp)})`)
        result.push(`{`);
        result.push(`\tTypedObjectManager* tom = GlobalStaticReferences::Instance()->GetTypedObjectManager();`);
        result.push(`\t${this.config.className(GeneratedType.cpp)}* nativeClassInstance = tom->GetInstance<${this.config.className(GeneratedType.cpp)}>(managedInstanceId);`);
        result.push(`\tnativeClassInstance->${methodConfig.name}(${methodConfig.getArgUses(GeneratedType.cpp)});`);
        result.push(`}`);
        return result.join('\n');
    }
};