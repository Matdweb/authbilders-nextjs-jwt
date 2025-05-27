"use server";
import { cookies } from "next/headers";
import { decrypt } from "../utils/jwt";

export async function getSession() {
    const cookieStore = await cookies();

    const session = cookieStore.get("session")?.value;
    if (!session) return null;
    return await decrypt(session);
}