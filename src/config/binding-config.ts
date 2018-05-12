import { GeneratedType, ValidArguments } from "./argument-binding";

export interface BindingConfiguration {
    namespace: string;
    outputCppDirectory: string;
    outputCsDirectory: string;
    fileBindings: Array<FileBinding>
}

export interface FileBinding {
    name: string;
    includePath: string;
    subdirectory: string;
    methods: Array<MethodBinding>;
}

export interface MethodBinding {
    methodType: 'instance' | 'static';
    methodName: string;
    returnTypeInfo: string;
    argInfo: Array<string>;
}

export const MethodBindingHelpers = {
    getArgument: function(info: string, type: GeneratedType) : string {
        const argInfo = ValidArguments[info];
        switch(type) {
            case GeneratedType.cpp:
                return argInfo.cpp;
            case GeneratedType.cs:
                return argInfo.cs;
        }
    },

    returnType: function(method: MethodBinding, type: GeneratedType): string {
        return this.getArgument(method.returnTypeInfo, type);
    },

    getArgUses: function(method: MethodBinding, type: GeneratedType): string {
        let result: string[] = [];
        for (let i=0; i < method.argInfo.length; i++) {
            result.push(`arg${i}`);
        }
        return result.join(', ');
    },
    
    getArgDefinitions: function(method: MethodBinding, type: GeneratedType): string {
        let result: string[] = [];
        for (let i=0; i < method.argInfo.length; i++) {
            const arg = method.argInfo[i];
            result.push(`${this.getArgument(arg, type)} arg${i}`);
        }
        return result.join(', ');
    }
}
