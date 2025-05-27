import type { CreateEmailResponseSuccess } from "resend";

export type AuthServerActionState = {
  success?: boolean;
  message?: string[];
  user?: AuthServerActionStateUser;
  data?: AuthServerActionStateData;
  errors?: AuthServerActionStateErrors;
} | undefined;

export type AuthServerActionStateUser = {
  uid?: string;
  email?: string;
  displayName?: string;
} | null;

export type AuthServerActionStateData = CreateEmailResponseSuccess | null;

export type AuthServerActionStateErrors = {
  name?: string[];
  email?: string[];
  password?: string[];
  [key: string]: string[] | undefined;
};

export type User = {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
  exp?: number;
  password?: string;
};

export type authenticateActionErrors = {
  name?: string[] | undefined;
  email?: string[] | undefined;
  password?: string[] | undefined;
};

export type ServerResponse<T = unknown> = {
  success: boolean;
  message: string[];
  data?: T | null;
};

export type CatchedError = {
  code?: string;
}