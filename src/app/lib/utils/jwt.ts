import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET_KEY || "";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("100 sec from now")
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;

    } catch (error) {
        console.log("Decryption error:", error);
        return null;
    }
}
