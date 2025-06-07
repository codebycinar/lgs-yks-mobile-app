export interface User {
  id: number;
  phoneNumber: string;
  name: string;
  surname: string;
  gender: 'male' | 'female';
  classId?: number;
  className?: string;
  examId?: number;
  examName?: string;
  createdAt: string;
}

export interface LoginRequest {
  phoneNumber: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  name: string;
  surname: string;
  classId: number;
  gender: 'male' | 'female';
}

export interface VerifySMSRequest {
  phoneNumber: string;
  verificationCode: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SMSResponse {
  message: string;
  expiresAt: string;
}