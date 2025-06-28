import User, { IUser } from "../../model/User";
import { BaseRepository } from "../BaseRepository";
import { IAuthRepository } from "../Interface/IAuthRepository";

export class AuthRepository extends BaseRepository<IUser> implements IAuthRepository {
  constructor() {
    super(User);
  }
  
  async countUsersByRole(role: string): Promise<number> {
    return this.model.countDocuments({ role });
  }

  async createUser(user: IUser): Promise<IUser> {
    return this.create(user); 
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email });
  }

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    await this.model.findByIdAndUpdate(userId, { refreshToken: token });
  }

  async findByRefreshToken(token: string): Promise<IUser | null> {
    return this.model.findOne({ refreshToken: token });
  }
}
