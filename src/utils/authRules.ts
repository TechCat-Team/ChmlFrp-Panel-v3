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
            type: 'email',
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
            message: '条款不能不选',
            trigger: 'blur'
        },
    ]
}
