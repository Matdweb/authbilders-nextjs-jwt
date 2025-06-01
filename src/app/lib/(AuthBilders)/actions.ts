"use server";
import { cookies } from "next/headers";
import { AuthServerActionState } from "@/app/lib/(AuthBilders)/defintions";
import { successResponse, errorResponse } from "./utils/response";
import type { User } from "@/app/lib/(AuthBilders)/defintions";
import { FormDataSchema } from "./zod";
import { addUser, findUserByEmail, validateUser } from "@/app/lib/(AuthBilders)/dal/queries";
import { encrypt } from "./utils/jwt";
import { extractErrorDetails } from "./utils/errors";

const timeSec = 100; // 100 seconds

const extractUser = (user: User) => ({
  id: user?.id || '',
  email: user?.email || '',
  name: user?.name || '',
})

export async function login(
  _prev: AuthServerActionState,
  formData: FormData
): Promise<AuthServerActionState> {
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

export async function signUp(
  _prev: AuthServerActionState,
  formData: FormData
): Promise<AuthServerActionState> {
  try {
    const fields = FormDataSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!fields.success) {
      return errorResponse(['Sign Up failed. Check input.'], fields.error.flatten().fieldErrors)
    }

    const { email, password } = fields.data;
    const exists = findUserByEmail(email);

    if (exists) {
      return errorResponse(['User already exists'], {
        email: ['Email already registered']
      });
    }

    const res = await addUser({ email, password });
    if (!res?.success) {
      return errorResponse(['Failed to register user'], res?.errors || {});
    }

    return successResponse(['Account created successfully!']);
  }
  catch (error) {
    const { message = 'Unexpected error occurred' } = extractErrorDetails(error);
    return errorResponse(['Failed to register user'], {
      email: [message || 'Failed to register user']
    });
  }
}