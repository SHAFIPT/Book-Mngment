import { IUser } from "../../model/User";

export interface IAuthRepository {
    createUser(user: IUser): Promise<IUser>;
    findByEmail(email: string): Promise<IUser | null>;
    saveRefreshToken(userId: string, token: string): Promise<void>;
    findByRefreshToken(token: string): Promise<IUser | null>;
    countUsersByRole(role: string): Promise<number>
  }