import { MethodBinding } from "./method-binding";
import { GeneratedType } from "./argument-binding";

export class FileBinding
{
    public includePath: string;
    public name: string;
    private methods: Array<MethodBinding>;

    constructor(json: any)
    {
        this.includePath = json.includePath;
        this.name = json.name;
        
        this.methods = new Array<MethodBinding>();
        for (const m of json.methods) {
            this.methods.push(new MethodBinding(m));
        }
    }
    
    public get allMethods(): MethodBinding[] { return this.methods; }
}
