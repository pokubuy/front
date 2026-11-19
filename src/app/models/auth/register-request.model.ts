import { LoginRequest } from './login-request.model';

export interface RegisterRequest extends LoginRequest {
  readonly username: string;
}

export type RegistrationKind = 'client' | 'seller';
