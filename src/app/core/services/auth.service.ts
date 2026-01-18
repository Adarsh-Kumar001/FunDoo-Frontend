import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private api: ApiService) {}

  register(data: any) {
    return this.api.post('/auth/register', data);
  }

  login(data: any) {
    return this.api.post<any>('/auth/login', data);
  }

  verifyEmail(token: string) {
    return this.api.post('/auth/verify-email', { token });
  }

  forgotPassword(email: string) {
    return this.api.post('/auth/forgot-password', { email });
  }

  resetPassword(data: any) {
    return this.api.post('/auth/reset-password', data);
  }
}
