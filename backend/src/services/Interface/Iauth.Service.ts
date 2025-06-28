import { LoginDTO, RegisterDTO } from "../../dtos/authDTO";
import { IUser } from "../../model/User";

export interface IAuthService {
    register(data: RegisterDTO): Promise<IUser>;
    login(data: LoginDTO): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
    refreshToken(token: string): Promise<string>;
    logout(userId: string): Promise<void>;
}