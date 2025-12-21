import { UserRole } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      tosAcceptedAt: string | null;
      profileDoneAt: string | null;
      questionnaireCompleted: string | null;
      needsPassword?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    tosAcceptedAt: string | null;
    profileDoneAt: string | null;
    questionnaireCompleted: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole | string;
    tosAccepted?: boolean;
    profileDone?: boolean;
    questionnaireCompleted?: boolean;
    emailVerified?: boolean;
    needsPassword?: boolean;
  }
}
