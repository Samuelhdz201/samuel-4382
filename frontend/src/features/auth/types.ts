export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>;