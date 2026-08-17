export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
}