'use client';
import AuthForm from '@/components/Form/AuthForm'
import { passwordSchema } from '@/app/lib/zod'
import { login } from '@/app/lib/actions'

export default function LoginPage() {
    return (
        <AuthForm
            title="Login"
            action={login}
            redirectTo='/'
            fields={[
                {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                },
                {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    required: true,
                    schema: passwordSchema,
                    onValueChange: (val) => passwordSchema.safeParse(val).success || undefined
                }
            ]}
            thirdPartyProviders={['google', 'github']}
        />
    )
}
