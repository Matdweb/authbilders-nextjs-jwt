import { getSession } from "@/app/lib/dal/session";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return Response.json({
            error: "Unauthorized",
            message: "You are not authorized to access this resource.",
            code: 401,
        }, { status: 200 }); // 200 is used so that client stil displays response
    }
    const data = {
        message: "Hello from API route!",
        timestamp: new Date().toISOString(),
        user_id: session?.user?.id,
        code: 200
    }

    return Response.json({ data }, { status: 200 });
}