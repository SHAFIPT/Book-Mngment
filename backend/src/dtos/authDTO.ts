export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'AUTHOR' | 'RETAIL';
  }
  
  export interface LoginDTO {
    email: string;
    password: string;
  }