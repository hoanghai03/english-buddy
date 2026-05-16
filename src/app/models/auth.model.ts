export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface OAuthLoginRequest {
  provider: 'google' | 'facebook' | 'github';
  token: string;
}

export interface UserDto {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}
