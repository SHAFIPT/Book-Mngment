import { Messages } from "../../constants/messages";
import bcrypt from 'bcryptjs';
import { LoginDTO, RegisterDTO } from "../../dtos/authDTO";
import { IUser } from "../../model/User";
import { IAuthRepository } from "../../repository/Interface/IAuthRepository";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/token";
import { IAuthService } from "../Interface/Iauth.Service";
import { ApiError } from "../../utils/ApiError";
import { HttpStatusCode } from "../../constants/statusCode";
import { v4 as uuidv4 } from 'uuid';

export class AuthService implements IAuthService {
  constructor(private authRepo: IAuthRepository) {}

  async register(data: RegisterDTO): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
  
    // Generate unique userId prefix
    let prefix = '';
    if (data.role === 'ADMIN') prefix = 'A';
    else if (data.role === 'AUTHOR') prefix = 'AU';
    else if (data.role === 'RETAIL') prefix = 'R';
  
    // Count users with the same role
    const userId = `${prefix}-${uuidv4().slice(0, 8)}`;
  
    const user = await this.authRepo.createUser({
      ...data,
      userId,
      password: hashedPassword,
    } as IUser);
  
    return user;
  }

  
  async login(data: LoginDTO): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this.authRepo.findByEmail(data.email);

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new ApiError(HttpStatusCode.UNAUTHORIZED, Messages.INVALID_CREDENTIALS);
    }
  
    // Inactive account
    if (user.status === 'inactive') {
      throw new ApiError(HttpStatusCode.FORBIDDEN, Messages.ACCOUNT_INACTIVE);
    }

    const userId = user._id.toString();
    const accessToken = generateAccessToken({ id: userId, role: user.role });
    const refreshToken = generateRefreshToken({ id: userId, role: user.role });

    await this.authRepo.saveRefreshToken(userId, refreshToken);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;
    delete userObj.__v;

    return {
      user: userObj as IUser,
      accessToken,
      refreshToken,
    };
  }
  
  

  async refreshToken(token: string): Promise<string> {
    const decoded: any = verifyRefreshToken(token);
    const user = await this.authRepo.findByRefreshToken(token);
    if (!user || user._id.toString() !== decoded.id) {
      throw new Error(Messages.UNAUTHORIZED);
    }

    return generateAccessToken({ id: user._id.toString(), role: user.role });
  }
  
    async logout(userId: string): Promise<void> {
        await this.authRepo.saveRefreshToken(userId, '');
    }
}