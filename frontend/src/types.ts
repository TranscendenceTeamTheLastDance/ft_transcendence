export type User = {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  hash: string;
  profilePic: string;
  twoFactorSecret: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};