import { GenerationConfig } from "../config/generation-config";
import { GeneratedType } from "../config/argument-info";
import { MethodConfig } from "../config/method-config";

export class CppGenerator
{
    constructor(private config: GenerationConfig) { }

    public cppHeaderFileTemplate(): string {
        const result: Array<string> = new Array<string>();
        result.push(`#pragma once\n`);
        
        result.push(`#pragma warning(push)`);
        result.push(`#pragma warning(disable:4201)`);
        result.push(`#include <mono/metadata/object.h>`);
        result.push(`#pragma warning(pop)\n`);

        result.push(`class ${this.config.className(GeneratedType.cpp)}API`);
        result.push(`{`);
        result.push(`\tstatic void RegisterCalls();`);
        result.push(`${this.cppGenerateMethodDefinitions()}`);
        result.push(`};`);
        return result.join('\n');
    }

    public cppSourceFileTemplate(): string {
        const result: Array<string> = new Array<string>();
        result.push(`#include "stdafx.h"`);
        result.push(`#include "${this.config.className(GeneratedType.cpp)}API.h"`);
        result.push(`#include "Engine/Core/GlobalStaticReferences.h"`);
        result.push(`#include "${this.config.includePath}"\n`);

        result.push(`${this.cppRegisterCalls()}\n`);
        result.push(`${this.cppGenerateMethods()}`);
        return result.join('\n');
    }

    private cppGenerateMethodDefinitions(): string {
        const result: Array<string> = new Array<string>();
        for (const m of this.config.allMethods) {
            if (m.type === 'instance') {
                result.push(this.cppInstanceMethodDefinition(m));
            } else if (m.type === 'static') {
                result.push(this.cppStaticMethodDefinition(m));
            }
        }        
        return result.join('\n');
    }
    
    private cppInstanceMethodDefinition(methodConfig: MethodConfig): string {
        return `\tstatic ${methodConfig.returnType(GeneratedType.cpp)} ${methodConfig.name}(int managedInstanceId, ${methodConfig.getArgDefinitions(GeneratedType.cpp)});`
    }
    
    private cppStaticMethodDefinition(methodConfig: MethodConfig): string {
        return `\tstatic ${methodConfig.returnType(GeneratedType.cpp)} ${methodConfig.name}(${methodConfig.getArgDefinitions(GeneratedType.cpp)});`
    }
    
    private cppRegisterCalls(): string {        
        const result: Array<string> = new Array<string>();
        result.push(`void ${this.config.className(GeneratedType.cpp)}API::RegisterCalls()`);
        result.push(`{`);
        for (const m of this.config.allMethods) {
            if (m.type === 'instance') {
                result.push(this.cppAddInstanceMonoCall(m));
            } else if (m.type === 'static') {
                result.push(this.cppAddStaticMonoCall(m));
            }
        }
        result.push(`}`);
        return result.join('\n');
    }

    private cppAddInstanceMonoCall(methodConfig: MethodConfig): string {
        return `\tmono_add_internal_call("${this.config.className(GeneratedType.cs)}::${methodConfig.name}(int managedInstanceId, ${methodConfig.getArgDefinitions(GeneratedType.cs)})", ${this.config.className(GeneratedType.cpp)}API::${methodConfig.name});`
    }
    
    private cppAddStaticMonoCall(methodConfig: MethodConfig): string {
        return `\tmono_add_internal_call("${this.config.className(GeneratedType.cs)}::${methodConfig.name}", ${this.config.className(GeneratedType.cpp)}API::${methodConfig.name});`
    }

    private cppGenerateMethods(): string {
        const methods: string[] = [];
        for (const m of this.config.allMethods) {
            if (m.type === 'instance') {
                methods.push(this.cppInstanceMethod(m));
            } else if (m.type === 'static') {
                methods.push(this.cppStaticMethod(m));
            }
        }
        return methods.join('\n\n');
    }

    private cppInstanceMethod(methodConfig: MethodConfig): string {
        const result: Array<string> = new Array<string>();
        result.push(`${methodConfig.returnType(GeneratedType.cpp)} ${this.config.className(GeneratedType.cpp)}API::${methodConfig.name}(int managedInstanceId, ${methodConfig.getArgDefinitions(GeneratedType.cpp)})`)
        result.push(`{`);
        result.push(`\tScriptedManager* sm = GlobalStaticReferences::Instance()->GetScriptedManager();`);
        result.push(`\tClassID nativeClassId = ${this.config.className(GeneratedType.cpp)}::GetTypeID();`);
        result.push(`\t${this.config.className(GeneratedType.cpp)}* nativeClassInstance = static_cast<${this.config.className(GeneratedType.cpp)}*>(sm->GetNativeInstance(nativeClassId, managedInstanceId));`);
        result.push(`\tnativeClassInstance->${methodConfig.name}(${methodConfig.getArgUses(GeneratedType.cpp)});`);
        result.push(`}`);
        return result.join('\n');
    }
        
    private cppStaticMethod(methodConfig: MethodConfig): string {
        const result: Array<string> = new Array<string>();
        result.push(`${methodConfig.returnType(GeneratedType.cpp)} ${this.config.className(GeneratedType.cpp)}API::${methodConfig.name}(${methodConfig.getArgDefinitions(GeneratedType.cpp)})`);
        result.push(`{`);
        result.push(`\t[LOGIC]`);
        result.push(`}`);
        return result.join('\n');
    }
};