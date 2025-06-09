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

export interface AuthResponse {
  user?: {
    id: number;
    username: string;
    email: string;
    createdAt?: string; // Opsional, sesuai frontend
  };
  token?: string; // Opsional, hanya untuk register/login
  message: string;
  resetToken?: string; // Opsional, hanya untuk forgot password
  resetLink?: string; // Opsional, hanya untuk forgot password
}