import { GeneratedType, ValidArguments, MarshallInfo } from "./argument-binding";

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
    name: string;
    returnType: string;
    args: Array<string>;
}

export const MethodBindingHelpers = {
    getMarshall: function(info: string) : MarshallInfo | undefined {
        const argInfo = ValidArguments[info];
        return argInfo.marshall;
    },
    
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
        return this.getArgument(method.returnType, type);
    },

    getArgUses: function(method: MethodBinding, type: GeneratedType): string {
        let result: string[] = [];
        for (let i=0; i < method.args.length; i++) {
            if (type === GeneratedType.cpp && this.getMarshall(method.args[i])) {
                result.push(`arg${i}_marshalled`);
            } else {
                result.push(`arg${i}`);
            }
        }
        return result.join(', ');
    },
    
    getArgDefinitions: function(method: MethodBinding, type: GeneratedType): string {
        let result: string[] = [];
        for (let i=0; i < method.args.length; i++) {
            const arg = method.args[i];
            result.push(`${this.getArgument(arg, type)} arg${i}`);
        }
        return result.join(', ');
    }
}
