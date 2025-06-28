import { FormRules } from 'naive-ui'

export const loginRules: FormRules = {
    password: [
        {
            required: true,
            message: '密码不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{6,48}$/,
            message: '密码6~48位，且至少包含字母、数字、特殊符号中任意两种',
            trigger: ['blur', 'input']
        }
    ],
}

export const registerRules: FormRules = {
    username: [
        {
            required: true,
            message: '用户名不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^[A-Za-z0-9_@./#&+-]{0,20}$/,
            message: '用户名只能包含字母、数字和常用的特殊字符',
            trigger: ['blur', 'input']
        }
    ],
    qq: [
        {
            required: true,
            message: 'QQ号不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^[0-9]{1,20}$/,
            message: 'QQ号只能为数字，且最大20位',
            trigger: ['blur', 'input']
        }
    ],
    password: [
        {
            required: true,
            message: '密码不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{6,48}$/,
            message: '密码6~48位，且至少包含字母、数字、特殊符号中任意两种',
            trigger: ['blur', 'input']
        }
    ],
    email: [
        {
            required: true,
            message: '邮箱不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
            message: '请输入有效的邮箱地址',
            trigger: ['blur', 'input']
        }
    ],
    confirmPassword: [
        {
            required: true,
            message: '请确认密码',
            trigger: 'blur'
        }
    ],
    verificationCode: [
        {
            required: true,
            message: '验证码不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^[0-9]{6}$/,
            message: '验证码必须为6位数字',
            trigger: ['blur', 'input']
        }
    ],
    clause: [
        {
            required: true,
            message: '不同意条款则无法使用我们的服务',
            trigger: 'blur'
        },
    ]
}

export const resetRules: FormRules = {
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱格式', trigger: ['blur', 'input'] }
    ],
    verificationCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        {
            pattern: /^[0-9]{6}$/,
            message: '验证码必须为6位数字',
            trigger: ['blur', 'input']
        }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        {
            pattern: /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{6,48}$/,
            message: '密码6~48位，且至少包含字母、数字、特殊符号中任意两种',
            trigger: ['blur', 'input']
        }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
            validator: (_rule: any, value: string, values: any) => {
                if (value !== values.newPassword) {
                    return new Error('两次输入的密码不一致');
                }
                return true;
            },
            trigger: 'blur'
        }
    ]
}

// 实名认证规则
export const realNameRules: FormRules = {
    name: [
        { required: true, message: '请输入真实姓名', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5A-Za-z·]{2,20}$/, message: '姓名格式不正确', trigger: ['blur', 'input'] }
    ],
    idCard: [
        { required: true, message: '请输入身份证号', trigger: 'blur' },
        { pattern: /^(\d{15}|\d{17}[\dXx])$/, message: '身份证号格式不正确', trigger: ['blur', 'input'] }
    ]
}

// 兑换码规则
export const exchangeCodeRules: FormRules = {
    exchangeCode: [
        { required: true, message: '请输入兑换码', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9\-]{8,32}$/, message: '兑换码格式不正确', trigger: ['blur', 'input'] }
    ]
}


// 修改邮箱规则
export const resetEmailRules: FormRules = {
    old_code: [
        { required: true, message: '请输入旧邮箱验证码', trigger: 'blur' },
        { pattern: /^[0-9]{6}$/, message: '验证码必须为6位数字', trigger: ['blur', 'input'] }
    ],
    newEmail: [
        { required: true, message: '请输入新的邮箱', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, message: '请输入有效的邮箱地址', trigger: ['blur', 'input'] }
    ],
    new_code: [
        { required: true, message: '请输入新邮箱验证码', trigger: 'blur' },
        { pattern: /^[0-9]{6}$/, message: '验证码必须为6位数字', trigger: ['blur', 'input'] }
    ]
}

// 修改QQ号规则
export const updateQQRules: FormRules = {
    newQQ: [
        { required: true, message: '请输入新的QQ号', trigger: 'blur' },
        { pattern: /^[0-9]{5,20}$/, message: 'QQ号只能为5-20位数字', trigger: ['blur', 'input'] }
    ]
}

// 修改头像规则
export const updateUserImageRules: FormRules = {
    newUserImage: [
        { required: true, message: '请选择新的头像', trigger: 'change' }
    ]
}

// 修改用户名规则
export const updateUserNameRules: FormRules = {
    newUserName: [
        { required: true, message: '请输入新的用户名', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9_@./#&+-]{2,20}$/, message: '用户名只能包含字母、数字和常用的特殊字符，2-20位', trigger: ['blur', 'input'] }
    ]
}
