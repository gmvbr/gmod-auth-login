export interface UserResult {
  id: string;
  email: string;
}

export interface TokenResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
