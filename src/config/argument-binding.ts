export enum GeneratedType {
    cpp,
    cs
}

export interface MarshallInfo {
    toType: string;
    toNativeMethod: string;
    toManagedMethod: string;
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
        cpp: 'MonoObject*',
        cs: 'Vector4',
        marshall: {
            toType: 'Vector4',
            toNativeMethod: 'MonoMarshall::GetVector4',
            toManagedMethod: 'MonoMarshall::GetManagedVector4'
        }
    },
    'vector3': {
        cpp: 'MonoObject*',
        cs: 'Vector3',
        marshall: {
            toType: 'Vector3',
            toNativeMethod: 'MonoMarshall::GetVector3',
            toManagedMethod: 'MonoMarshall::GetManagedVector3'
        }
    },
    'vector2': {
        cpp: 'MonoObject*',
        cs: 'Vector2',
        marshall: {
            toType: 'Vector2',
            toNativeMethod: 'MonoMarshall::GetVector2',
            toManagedMethod: 'MonoMarshall::GetManagedVector2'
        }
    },
    'matrix4x4': {
        cpp: 'MonoObject*',
        cs: 'Matrix4x4',
        marshall: {
            toType: 'Matrix4x4',
            toNativeMethod: 'MonoMarshall::GetMatrix4x4',
            toManagedMethod: 'MonoMarshall::GetManagedMatrix4x4'
        }
    },
    'matrix3x3': {
        cpp: 'MonoObject*',
        cs: 'Matrix3x3',
        marshall: {
            toType: 'Matrix3x3',
            toNativeMethod: 'MonoMarshall::GetMatrix3x3',
            toManagedMethod: 'MonoMarshall::GetManagedMatrix3x3'
        }
    },
    'quaternion': {
        cpp: 'MonoObject*',
        cs: 'Quaternion',
        marshall: {
            toType: 'Quaternion',
            toNativeMethod: 'MonoMarshall::GetQuaternion',
            toManagedMethod: 'MonoMarshall::GetManagedQuaternion'
        }
    }
}