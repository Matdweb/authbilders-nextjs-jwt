import { Providers } from "./providers";
import { CountDownTimer } from "@/components/(AuthBilders)/CountDownTimer";
import { getSession } from "@/app/lib/(AuthBilders)/dal/session";
import { UserInfo } from "@/components/(AuthBilders)/UserInfo";
import SessionErrorToastHandler from "@/components/(AuthBilders)/Handlers/SessionErrorToastHandler";

export default async function AuthBilders({ children }: { children: React.ReactNode; }) {
    const session = await getSession();
    return (
        <Providers>
            {children}
            {<SessionErrorToastHandler data={session} />}
            {<CountDownTimer data={session} />}
            {<UserInfo data={session?.user} />}
        </Providers>
    );
}