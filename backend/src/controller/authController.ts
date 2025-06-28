import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../constants/statusCode';
import { Messages } from '../constants/messages';
import { IAuthService } from '../services/Interface/Iauth.Service';
import { AuthenticatedRequest } from '../types/express';

export class AuthController {
  constructor(private authService: IAuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.register(req.body);
      res.status(HttpStatusCode.CREATED).json({ message: Messages.REGISTER_SUCCESS, user });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await this.authService.login(req.body);
    
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", 
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    
        res.status(HttpStatusCode.OK).json({
          message: Messages.LOGIN_SUCCESS,
          user: result.user,
          accessToken: result.accessToken,
        });
      } catch (error) {
        next(error);
      }
    };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newToken = await this.authService.refreshToken(req.body.refreshToken);
      res.status(HttpStatusCode.OK).json({ message: Messages.REFRESH_SUCCESS, accessToken: newToken });
    } catch (error) {
      next(error);
    }
  };
  
  logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({ message: Messages.UNAUTHORIZED });
          return
      }

      await this.authService.logout(userId);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });    

      res.status(HttpStatusCode.OK).json({ message: Messages.LOGOUT_SUCCESS });
    } catch (error) {
      next(error);
    }
  };
}