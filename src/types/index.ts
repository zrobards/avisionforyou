export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "MODERATOR" | "ADMIN";
  createdAt: Date;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  createdBy: string;
  createdAt: Date;
}

export interface Donation {
  id: string;
  amount: number;
  donorId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: Date;
}
