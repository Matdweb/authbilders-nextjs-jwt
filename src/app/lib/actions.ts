"use server";
import { cookies } from "next/headers";
import { AuthServerActionState } from "@/app/lib/defintions";
import { successResponse, errorResponse } from "./utils/response";
import type { User } from "@/app/lib/defintions";
import { FormDataSchema } from "./zod";
import { validateUser } from "@/app/lib/dal/queries";
import { encrypt } from "./utils/jwt";

const timeSec = 100; // 100 seconds

const extractUser = (user: User) => ({
  id: user?.id || '',
  email: user?.email || '',
  name: user?.name || '',
})

export async function login(_prev: AuthServerActionState, formData: FormData) {
  const cookieStore = await cookies();
  //validate the data
  const fields = FormDataSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!fields.success) {
    return errorResponse(['Login failed. Check input.'], fields.error.flatten().fieldErrors)
  }

  // Check if the user exists and validate the password
  const { email, password } = fields.data;
  const user = await validateUser(email, password);

  if (!user) {
    return errorResponse(['Login failed. Invalid email or password.'], {});
  }
  // Create a session token
  const expires = new Date(Date.now() + timeSec * 1000);
  const session = await encrypt({ user, expires });

  cookieStore.set("session", session, { expires, httpOnly: true });

  return successResponse(['Logged in successfully'], {
    user: extractUser(user),
  });
}

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.set("session", "", { expires: new Date(0) });
}