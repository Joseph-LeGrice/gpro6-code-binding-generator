export enum GeneratedType {
    cpp,
    cs,
    cs_method_descriptor
}

export interface MarshallInfo {
    toType: string;
    toNativeMethod: string;
    toManagedMethod: string;
}

export interface ArgumentInfo {
    cpp: string;
    cs: string;
    cs_method_descriptor?: string;
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
        cs: 'float',
        cs_method_descriptor: 'single'
    },
    'double': {
        cpp: 'double',
        cs: 'double'
    },
    'char': {
        cpp: 'char',
        cs: 'char'
    },
    'bool': {
        cpp: 'bool',
        cs: 'bool'
    },
    'string': {
        cpp: 'MonoString*',
        cs: 'string',
        marshall: {
            toType: 'std::wstring',
            toNativeMethod: 'MonoMarshall::GetUTF16String',
            toManagedMethod: 'MonoMarshall::GetManagedUTF16String'
        }
    },
    'array-string': {
        cpp: 'MonoArray*',
        cs: 'System.Collections.Generic.List<string>',
        marshall: {
            toType: 'std::vector<std::wstring>',
            toNativeMethod: 'MonoMarshall::GetStringVector',
            toManagedMethod: 'MonoMarshall::GetManagedStringVector'
        }
    },
    'vector4': {
        cpp: 'Vector4',
        cs: 'Vector4'
    },
    'vector3': {
        cpp: 'Vector3',
        cs: 'Vector3'
    },
    'vector2': {
        cpp: 'Vector2',
        cs: 'Vector2'
    },
    'matrix4x4': {
        cpp: 'Matrix4x4',
        cs: 'Matrix4x4'
    },
    'matrix3x3': {
        cpp: 'Matrix3x3',
        cs: 'Matrix3x3'
    },
    'quaternion': {
        cpp: 'Quaternion',
        cs: 'Quaternion'
    }
}