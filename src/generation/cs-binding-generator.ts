import { FileBinding, MethodBinding, MethodBindingHelpers } from "../config/binding-config";
import { GeneratedType } from "../config/argument-binding";
import { BatchFileGenerator, GeneratorUtil } from "./code-generator";
import * as path from "path";

export class CsBindingGenerator extends BatchFileGenerator
{
    protected generateFileSkeleton(file: FileBinding): string {
        const result: Array<string> = new Array<string>();
        result.push(`using System.Runtime.CompilerServices;\n`)

        result.push(`public class ${file.name} : ITypedObject`);
        result.push(`{`);
        result.push(GeneratorUtil.delimiter);
        result.push(GeneratorUtil.delimiter);
        result.push(`}`);
        return result.join('\n');
    }
    
    protected appendMethodInfo(file: FileBinding, fileText: string): string {
        let result = GeneratorUtil.clear(fileText);
        for (const m of file.methods) {
            if (m.methodType === 'instance') {
                result = GeneratorUtil.insert(`${this.instanceMethod(m)}\n`, result);
            } else if (m.methodType === 'static') {
                result = GeneratorUtil.insert(`${this.staticMethod(m)}\n`, result);
            }
        }
        return result;
    }

    protected getFileName(file: FileBinding) {
        return path.resolve(this.config.outputCsDirectory, file.subdirectory, `${file.name}.cs`);
    }

    private instanceMethod(method: MethodBinding): string {
        const result: Array<string> = new Array<string>();
        result.push(`\t[MethodImpl(MethodImplOptions.InternalCall)]`);
        result.push(this.externMethodSignature(method));
        result.push(`\tpublic ${MethodBindingHelpers.returnType(method, GeneratedType.cs)} ${method.name}(${MethodBindingHelpers.getArgDefinitions(method, GeneratedType.cs)})`);
        result.push(`\t{`);
        result.push(...this.externMethodCall(method));
        result.push(`\t}`);
        return result.join('\n');
    }
    
    private externMethodSignature(method: MethodBinding): string {
        const args = MethodBindingHelpers.getArgDefinitions(method, GeneratedType.cs)
        if (args.length > 0) {
            return `\tprivate extern static ${MethodBindingHelpers.returnType(method, GeneratedType.cs)} ${method.name}(int instanceid, ${args});`;
        } else {
            return `\tprivate extern static ${MethodBindingHelpers.returnType(method, GeneratedType.cs)} ${method.name}(int instanceid);`;
        }
    }

    private externMethodCall(method: MethodBinding) {
        const argUses = MethodBindingHelpers.getArgUses(method, GeneratedType.cs);
        const result = new Array<string>();
        result.push('\t\t');
        if (method.returnType !== 'void') {
            result.push('return ');
        }

        if (argUses.length > 0) {
            result.push(`${method.name}(InstanceID, ${argUses});`);
        } else {
            result.push(`${method.name}(InstanceID);`);
        }
        return result;
    }

    private staticMethod(method: MethodBinding): string {
        const result: Array<string> = new Array<string>()
        result.push(`\t[MethodImplAttribute(MethodImplOptions.InternalCall)]`);
        result.push(`\tpublic extern static ${MethodBindingHelpers.returnType(method, GeneratedType.cs)} ${method.name}(${MethodBindingHelpers.getArgDefinitions(method, GeneratedType.cs)});`);
        return result.join('\n');
    }
}