export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

