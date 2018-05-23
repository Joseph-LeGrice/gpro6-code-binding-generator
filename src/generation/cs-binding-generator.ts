import { FileBinding, MethodBinding, MethodBindingHelpers, PropertyBinding } from "../config/binding-config";
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
        
        result = GeneratorUtil.insert(`${this.getTypeMethod(file)}\n`, result);

        for (const p of file.properties) {
            result = GeneratorUtil.insert(`${this.property(p)}\n`, result);
        }
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

    private getTypeMethod(file: FileBinding) {
        const result = new Array<string>();
        result.push(`\tpublic static string GetTypeID()`);
        result.push(`\t{`);
        result.push(`\t\treturn "${file.name}";`);
        result.push(`\t}`);
        return result.join('\n');
    }

    private property(prop: PropertyBinding): string {
        const result = new Array<string>();
        
        if (prop.getter) {
            result.push(`\t[MethodImpl(MethodImplOptions.InternalCall)]`);
            result.push(`\tprivate extern static ${MethodBindingHelpers.returnType(prop, GeneratedType.cs)} ${this.propertyGetter(prop, "int instanceId")}\n`);
        }
        
        if (prop.setter) {
            result.push(`\t[MethodImpl(MethodImplOptions.InternalCall)]`);
            result.push(`\tprivate extern static void ${this.propertySetter(prop, `int instanceId, ${MethodBindingHelpers.returnType(prop, GeneratedType.cs)} val`)}\n`);
        }

        result.push(`\tpublic ${MethodBindingHelpers.returnType(prop, GeneratedType.cs)} ${prop.name}`);
        result.push('\t{');
        if (prop.getter) {
            result.push(`\t\tget { return ${this.propertyGetter(prop, "InstanceID")} }`);
        }
        if (prop.setter) {
            result.push(`\t\tset { ${this.propertySetter(prop, "InstanceID, value")} }`);
        }
        result.push('\t}');
        return result.join('\n');
    }

    private propertyGetter(prop: PropertyBinding, withinParenthesis: string) {
        return `Get_${prop.name}(${withinParenthesis});`;
    }
    
    private propertySetter(prop: PropertyBinding, withinParenthesis: string) {
        return `Set_${prop.name}(${withinParenthesis});`;
    }

    private instanceMethod(method: MethodBinding): string {
        const result: Array<string> = new Array<string>();
        result.push(`\t[MethodImpl(MethodImplOptions.InternalCall)]`);
        result.push(this.externMethodSignature(method));
        result.push(`\tpublic ${MethodBindingHelpers.returnType(method, GeneratedType.cs)} ${method.name}(${MethodBindingHelpers.getArgDefinitions(method, GeneratedType.cs)})`);
        result.push(`\t{`);
        result.push(this.externMethodCall(method));
        result.push(`\t}`);
        return result.join('\n');
    }
    
    private externMethodSignature(method: MethodBinding): string {
        const args = MethodBindingHelpers.getArgDefinitions(method, GeneratedType.cs)
        if (args.length > 0) {
            return `\tprivate extern static ${MethodBindingHelpers.returnType(method, GeneratedType.cs)} ${method.name}(int instanceid, ${args});\n`;
        } else {
            return `\tprivate extern static ${MethodBindingHelpers.returnType(method, GeneratedType.cs)} ${method.name}(int instanceid);\n`;
        }
    }

    private externMethodCall(method: MethodBinding): string {
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
        return result.join('');
    }

    private staticMethod(method: MethodBinding): string {
        const result: Array<string> = new Array<string>()
        result.push(`\t[MethodImplAttribute(MethodImplOptions.InternalCall)]`);
        result.push(`\tpublic extern static ${MethodBindingHelpers.returnType(method, GeneratedType.cs)} ${method.name}(${MethodBindingHelpers.getArgDefinitions(method, GeneratedType.cs)});`);
        return result.join('\n');
    }
}