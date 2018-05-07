import { MethodBinding } from "./method-binding";
import { GeneratedType } from "./argument-binding";

export class FileBinding
{
    public includePath: string;
    public name: string;
    public subdirectory: string;
    public methods: Array<MethodBinding>;

    constructor(json: any)
    {
        this.name = json.name;
        this.includePath = json.includePath;
        this.subdirectory = json.subdirectory;
        
        this.methods = new Array<MethodBinding>();
        for (const m of json.methods) {
            this.methods.push(new MethodBinding(m));
        }
    }
}
