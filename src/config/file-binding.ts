import { MethodBinding } from "./method-binding";
import { GeneratedType } from "./argument-binding";

export class FileBinding
{
    private nativeIncludePath: string;
    private nativeClassName: string;
    private managedClassName: string;
    private methods: Array<MethodBinding>;

    constructor(json: any) {
        this.nativeIncludePath = json.nativeIncludePath;
        this.nativeClassName = json.nativeClassName;
        this.managedClassName = json.managedClassName;
        
        this.methods = new Array<MethodBinding>();
        for (const m of json.methods) {
            this.methods.push(new MethodBinding(m));
        }
    }
    
    public get allMethods(): MethodBinding[] { return this.methods; }
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
