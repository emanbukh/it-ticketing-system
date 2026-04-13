export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

export type SessionData = {
  userId: string;
  name: string;
  role: "USER" | "ADMIN";
  staffId?: string | null;
  username?: string | null;
};
