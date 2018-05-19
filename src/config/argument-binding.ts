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
    },
    'array-string': {
        cpp: 'MonoArray*',
        cs: 'string',
        marshall: {
            toType: 'std::vector<std::wstring>',
            withMethod: 'MonoMarshall::GetStringVector'
        }
    },
    'vector4': {
        cpp: 'MonoObject*',
        cs: 'Vector4',
        marshall: {
            toType: 'Vector4',
            withMethod: 'MonoMarshall::GetVector4'
        }
    },
    'vector3': {
        cpp: 'MonoObject*',
        cs: 'Vector3',
        marshall: {
            toType: 'Vector3',
            withMethod: 'MonoMarshall::GetVector3'
        }
    },
    'vector2': {
        cpp: 'MonoObject*',
        cs: 'Vector2',
        marshall: {
            toType: 'Vector2',
            withMethod: 'MonoMarshall::GetVector2'
        }
    },
    'matrix4x4': {
        cpp: 'MonoObject*',
        cs: 'Matrix4x4',
        marshall: {
            toType: 'Matrix4x4',
            withMethod: 'MonoMarshall::GetMatrix4x4'
        }
    },
    'matrix3x3': {
        cpp: 'MonoObject*',
        cs: 'Matrix3x3',
        marshall: {
            toType: 'Matrix3x3',
            withMethod: 'MonoMarshall::GetMatrix3x3'
        }
    }
}