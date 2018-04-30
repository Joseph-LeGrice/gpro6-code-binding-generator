import { MethodConfig } from "./method-config";
import { GeneratedType } from "./argument-info";

export class GenerationConfig
{
    private nativeIncludePath: string;
    private nativeClassName: string;
    private managedClassName: string;
    private methods: Array<MethodConfig>;

    constructor(json: any) {
        this.nativeIncludePath = json.nativeIncludePath;
        this.nativeClassName = json.nativeClassName;
        this.managedClassName = json.managedClassName;
        
        this.methods = new Array<MethodConfig>();
        for (const m of json.methods) {
            this.methods.push(new MethodConfig(m));
        }
    }
    
    public get allMethods(): MethodConfig[] { return this.methods; }
    public get includePath(): string { return this.nativeIncludePath; }
    public className(type: GeneratedType): string {
        switch(type)
        {
            case GeneratedType.cpp:
                return this.nativeClassName;
            case GeneratedType.cs:
                return this.managedClassName;
        }
    }
}
