import { GenerationConfig } from "../config/generation-config";

class CSGenerator 
{
    constructor(public config: GenerationConfig) { }

    private csFileTemplate(generatedMethods: string): string {
        return `
        //// GENERATED
        ${generatedMethods}
        //// GENERATED`
    }
    
    private csInstanceMethod(): string {
        return `[MethodImpl(MethodImplOptions.InternalCall)]  
        private extern static [MANAGED_RETURN_TYPE] [MANAGED_METHOD_NAME](int instanceid, [MANAGED_METHOD_ARGS]);  
    
        public [MANAGED_RETURN_TYPE] [MANAGED_METHOD_NAME]([MANAGED_METHOD_ARGS])  
        {  
            [MANAGED_METHOD_NAME](InstanceID, [MANAGED_METHOD_ARGS]);  
        }`
    }
    
    private csStaticMethod(): string {
        return `[MethodImplAttribute(MethodImplOptions.InternalCall)]  
        [VISIBILITY] extern static [MANAGED_RETURN_TYPE] [MANAGED_METHOD_NAME]([MANAGED_METHOD_ARGS]);`
    }
}