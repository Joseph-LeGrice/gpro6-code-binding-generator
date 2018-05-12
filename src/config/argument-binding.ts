export enum GeneratedType {
    cpp,
    cs
}

export interface MarshallInfo {
    toType: string;
    withMethod: string;
}

export interface ArgumentInfo {
    cpp: string;
    cs: string;
    marshall?: MarshallInfo;
}

export const ValidArguments: { [key: string]: ArgumentInfo } = {
    'void':  {
        cpp: 'void',
        cs: 'void'
    },
    'object' : {
        cpp: 'MonoObject*',
        cs: 'System.Object'
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
        cpp: 'MonoString*',
        cs: 'string',
        marshall: {
            toType: 'std::wstring',
            withMethod: 'MonoMarshall::GetUTF16String'
        }
    }
}
