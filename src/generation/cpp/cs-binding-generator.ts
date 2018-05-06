import { FileBinding } from "../../config/file-binding";
import { MethodBinding } from "../../config/method-binding";
import { GeneratedType } from "../../config/argument-binding";
import { BatchFileGenerator } from "./code-generator";
import * as path from "path";

export class CsBindingGenerator extends BatchFileGenerator
{
    protected generateFile(file: FileBinding): string {
        const result: Array<string> = new Array<string>();
        result.push(`using System.Runtime.CompilerServices;\n`)

        result.push(`class ${file.className(GeneratedType.cs)} : ITypedObject`);
        result.push(`{`);
        result.push(`\t//// GENERATED`)
        for (const m of file.allMethods) {
            if (m.type === 'instance') {
                result.push(`${this.csInstanceMethod(m)}\n`);
            } else if (m.type === 'static') {
                result.push(`${this.csStaticMethod(m)}\n`);
            }
        }
        result.push(`\t//// GENERATED`);
        result.push(`}`);
        return result.join('\n');
    }
    
    protected getFileName(file: FileBinding) {
        return path.join(this.config.outputCsDirectory, `${file.fileName(GeneratedType.cs)}.cs`);
    }

    private csInstanceMethod(method: MethodBinding): string {
        const result: Array<string> = new Array<string>();
        result.push(`\t[MethodImpl(MethodImplOptions.InternalCall)]`);
        result.push(`\tprivate extern static ${method.returnType(GeneratedType.cs)} ${method.name}(int instanceid, ${method.getArgDefinitions(GeneratedType.cs)});`);
        result.push(`\tpublic ${method.returnType(GeneratedType.cs)} ${method.name}(${method.getArgDefinitions(GeneratedType.cs)})`);
        result.push(`\t{`);
        result.push(`\t\t${method.name}(InstanceID, ${method.getArgUses(GeneratedType.cs)});`);
        result.push(`\t}`);
        return result.join('\n');
    }
    
    private csStaticMethod(method: MethodBinding): string {
        const result: Array<string> = new Array<string>()
        result.push(`\t[MethodImplAttribute(MethodImplOptions.InternalCall)]`);
        result.push(`\tpublic extern static ${method.returnType(GeneratedType.cs)} ${method.name}(${method.getArgDefinitions(GeneratedType.cs)});`);
        return result.join('\n');
    }
}