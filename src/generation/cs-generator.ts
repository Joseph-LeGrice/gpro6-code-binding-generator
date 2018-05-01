import { GenerationConfig } from "../config/generation-config";
import { MethodConfig } from "../config/method-config";
import { GeneratedType } from "../config/argument-info";

export class CsGenerator 
{
    constructor(public config: GenerationConfig) { }

    public csFileTemplate(): string {
        const result: Array<string> = new Array<string>();
        result.push(`class ${this.config.className(GeneratedType.cs)}`);
        result.push(`{`);
        result.push(`\t//// GENERATED`)
        for (const m of this.config.allMethods) {
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
    
    private csInstanceMethod(method: MethodConfig): string {
        const result: Array<string> = new Array<string>();
        result.push(`\t[MethodImpl(MethodImplOptions.InternalCall)]`);
        result.push(`\tprivate extern static ${method.returnType(GeneratedType.cs)} ${method.name}(int instanceid, ${method.getArgs(GeneratedType.cs)});`);
        result.push(`\tpublic ${method.returnType(GeneratedType.cs)} ${method.name}(${method.getArgs(GeneratedType.cs)})`);
        result.push(`\t{`);
        result.push(`\t\t${method.name}(InstanceID, ${method.getArgs(GeneratedType.cs)});`);
        result.push(`\t}`);
        return result.join('\n');
    }
    
    private csStaticMethod(method: MethodConfig): string {
        const result: Array<string> = new Array<string>()
        result.push(`\t[MethodImplAttribute(MethodImplOptions.InternalCall)]`);
        result.push(`\tpublic extern static ${method.returnType(GeneratedType.cs)} ${method.name}(${method.getArgs(GeneratedType.cs)});`);
        return result.join('\n');
    }
}