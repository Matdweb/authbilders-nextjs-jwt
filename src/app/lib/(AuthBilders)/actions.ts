"use server";
import { cookies } from "next/headers";
import { AuthServerActionState } from "@/app/lib/(AuthBilders)/defintions";
import { successResponse, errorResponse } from "./utils/response";
import type { User } from "@/app/lib/(AuthBilders)/defintions";
import { FormDataSchema } from "./zod";
import { addUser, findUserByEmail, validateUser } from "@/app/lib/(AuthBilders)/dal/queries";
import { encrypt } from "./utils/jwt";
import { extractErrorDetails } from "./utils/errors";
import { sendEmailVerification } from "./utils/email";
import { createResetPasswordToken } from "./utils/jwt";
import { passwordSchema } from "./zod";
import { resetUserPassword } from "@/app/lib/(AuthBilders)/dal/queries";

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

    const emailRes = await sendEmailVerification(email)

    if (!emailRes.success) {
      return errorResponse(['User created, but email failed', ...emailRes.message], {})
    }

    return successResponse(['User created', 'Verification email sent'], {
      user: res.user,
      data: emailRes.data,
    })
  }
  catch (error) {
    const { message = 'Unexpected error occurred' } = extractErrorDetails(error);
    return errorResponse(['Failed to register user'], {
      email: [message || 'Failed to register user']
    });
  }
}

export async function sendPasswordResetEmail(
  _prevState: AuthServerActionState,
  formData: FormData
): Promise<AuthServerActionState> {
  const email = formData.get("email") as string;
  const resetToken = await createResetPasswordToken(email);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const response = await fetch(`${baseUrl}/api/reset-password/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        redirectUrl: `${baseUrl}/forgot-password/reset-password?token=${resetToken}`
      }),
    });

    const result = await response.json();
    return {
      success: response.ok,
      message: [result?.message || "Unknown server response"],
      data: result?.data ?? null,
    };
  } catch (error) {
    const { message } = extractErrorDetails(error);
    errorResponse(["Email server error", message])
  }
}

export async function handlePasswordReset(
  _prevState: AuthServerActionState,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validated = passwordSchema.safeParse(password);
  if (!validated.success) {
    return errorResponse(["Invalid password"], {
      password: validated.error.flatten().fieldErrors[0]
    });
  }

  try {
    await resetUserPassword(email, password);

    return successResponse([
      "Password updated successfully.",
      "You can now login with your new password"
    ]);
  } catch {
    return errorResponse([
      "Failed to update password.",
      "Please try again"
    ]);
  }
}
