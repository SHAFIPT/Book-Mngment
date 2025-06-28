import { useDispatch } from 'react-redux';
import { loginUser, registerUser } from '../services/authService';
import type { LoginPayload, RegisterPayload } from '../types/auth';
import { loginSuccess } from '../redux/userSlice';
import { AxiosError } from 'axios';
import { setAccessToken } from '../utils/tokenUtils';

const useAuth = () => {
  const dispatch = useDispatch();

  const handleLogin = async (payload: LoginPayload) => {
    try {
        const res = await loginUser(payload);
        console.log('this is the res for login user: ',res)
      const { accessToken, user } = res;
      setAccessToken(accessToken)
      // Update Redux state
      dispatch(loginSuccess({ accessToken, user }));
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Login error:', axiosError);
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Login failed',
      };
    }
  };

  const handleRegister = async (payload: RegisterPayload) => {
    try {
        const res = await registerUser(payload);
        console.log('this is the res for register user: ',res)
      return { success: true, data: res };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Register error:', axiosError);
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Registration failed',
      };
    }
  };

  return {
    handleLogin,
    handleRegister,
  };
};

export default useAuth;
