export interface RenewTokenRequest {
  readonly refreshToken: string;
}

export interface RenewTokenResponse {
  readonly accessToken: string;
}
