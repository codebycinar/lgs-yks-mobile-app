export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  surname: string;
  gender: 'male' | 'female';
  classId?: string | null;
  className?: string | null;
  examId?: string | null;
  examName?: string | null;
  examDate?: string | null;
  createdAt: string;
}

export interface LoginRequest {
  phoneNumber: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  name: string;
  surname: string;
  classId: string;
  gender: 'male' | 'female';
}

export interface VerifySMSRequest {
  phoneNumber: string;
  verificationCode: string;
  name?: string;
  surname?: string;
  classId?: string;
  gender?: 'male' | 'female';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SMSResponse {
  message: string;
  expiresAt: string;
}

