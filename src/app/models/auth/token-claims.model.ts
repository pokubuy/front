// Used for display and refresh timing only. Authorization belongs to the API.
export interface TokenClaims {
  readonly exp: number;
  readonly preferred_username?: string;
  readonly email?: string;
}
