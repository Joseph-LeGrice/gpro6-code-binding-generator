import { GeneratedType, ArgumentInfo } from "./argument-info";

export class MethodConfig
{
    private methodType: 'instance' | 'static';
    private methodName: string;
    private returnTypeInfo: ArgumentInfo;
    private argInfo: Array<ArgumentInfo>;

    constructor(json: any) {
        this.methodType = json.methodType;
        this.methodName = json.methodName;
        this.returnTypeInfo = new ArgumentInfo(json.returnTypeInfo);
        
        this.argInfo = new Array<ArgumentInfo>();
        for (const ai of json.argInfo) {
            this.argInfo.push(new ArgumentInfo(ai))
        }
    }

    public returnType(type: GeneratedType): string {
        return this.returnTypeInfo.value(type);
    }

    public get name(): string { return this.methodName; }
    public get type(): string { return this.methodType; }
    public getArgs(type: GeneratedType): string {
        let result: string[] = [];
        for (const arg of this.argInfo) {
            result.push(arg.value(type));
        }
        return result.join(', ');
    }
}
