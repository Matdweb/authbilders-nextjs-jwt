import { errorResponse, } from './response';
import type { ThirdPartyProvidersNames } from '@/components/Form/AuthForm';

export const signInWithProvider = async (providerName: ThirdPartyProvidersNames) => {
    //providers logic here

    return errorResponse([`Failed to Login with ${providerName}`], {
        providers: ["Providers are not implemented yet"]
    })
}