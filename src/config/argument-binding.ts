export enum GeneratedType
{
    cpp,
    cs
}

const ValidArguments = {
    'void': {
        cpp: 'void',
        cs: 'void'
    },
    'int' : {
        cpp: 'int',
        cs: 'int'
    },
    'float': {
        cpp: 'float',
        cs: 'float'
    },
    'double': {
        cpp: 'double',
        cs: 'double'
    },
    'char': {
        cpp: 'char',
        cs: 'char'
    },
    'string': {
        cpp: 'const wchar_t*',
        cs: 'string'
    }
}

export class ArgumentBinding
{
    private cppValue: string;
    private csValue: string;
    
    constructor(arg: string) {
        this.cppValue = ValidArguments[arg].cpp;
        this.csValue = ValidArguments[arg].cs;
    }

    public value(type: GeneratedType): string {
        switch(type)
        {
            case GeneratedType.cpp:
                return this.cppValue;
            case GeneratedType.cs:
                return this.csValue;
        }
    }
}