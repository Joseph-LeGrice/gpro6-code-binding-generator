import { MethodBinding } from "./method-binding";
import { GeneratedType } from "./argument-binding";

export class FileBinding
{
    public includePath: string;
    private nativeClassName: string;
    private managedClassName: string;
    private methods: Array<MethodBinding>;

    constructor(json: any)
    {
        this.includePath = json.includePath;
        this.nativeClassName = json.nativeClassName;
        this.managedClassName = json.managedClassName;
        
        this.methods = new Array<MethodBinding>();
        for (const m of json.methods) {
            this.methods.push(new MethodBinding(m));
        }
    }
    
    public get allMethods(): MethodBinding[] { return this.methods; }
        
    public fileName(type: GeneratedType): string
    {
        switch(type)
        {
            case GeneratedType.cpp:
                return `${this.nativeClassName}API`;
            case GeneratedType.cs:
                return this.managedClassName;
        }
    }
    
    public className(type: GeneratedType): string
    {
        switch(type)
        {
            case GeneratedType.cpp:
                return this.nativeClassName;
            case GeneratedType.cs:
                return this.managedClassName;
        }
    }
}
