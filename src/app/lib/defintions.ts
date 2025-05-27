
export type AuthServerActionState = {
  success?: boolean;
  message?: string[];
  user?: User | null;
  errors?: AuthServerActionStateErrors;
} | undefined;

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

export interface Session {
  expires?: Date | string;
  exp?: number;
  user?: User;
  [key: string]: unknown;
}