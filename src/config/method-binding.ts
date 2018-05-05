import { GeneratedType, ArgumentBinding } from "./argument-binding";

export class MethodBinding
{
    private methodType: 'instance' | 'static';
    private methodName: string;
    private returnTypeInfo: ArgumentBinding;
    private argInfo: Array<ArgumentBinding>;

    constructor(json: any) {
        this.methodType = json.methodType;
        this.methodName = json.methodName;
        this.returnTypeInfo = new ArgumentBinding(json.returnTypeInfo);
        
        this.argInfo = new Array<ArgumentBinding>();
        for (const ai of json.argInfo) {
            this.argInfo.push(new ArgumentBinding(ai))
        }
    }

    public returnType(type: GeneratedType): string {
        return this.returnTypeInfo.value(type);
    }

    public get name(): string { return this.methodName; }
    public get type(): string { return this.methodType; }
    
    public getArgUses(type: GeneratedType): string {
        let result: string[] = [];
        for (let i=0; i < this.argInfo.length; i++) {
            const arg = this.argInfo[i];
            result.push(`arg${i}`);
        }
        return result.join(', ');
    }
    
    public getArgDefinitions(type: GeneratedType): string {
        let result: string[] = [];
        for (let i=0; i < this.argInfo.length; i++) {
            const arg = this.argInfo[i];
            result.push(`${arg.value(type)} arg${i}`);
        }
        return result.join(', ');
    }
}
