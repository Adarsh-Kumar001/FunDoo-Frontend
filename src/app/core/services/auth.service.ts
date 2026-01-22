import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private api: ApiService) {}

  register(data: {
    fullName: string;
    email: string;
    password: string;
  }) {
    return this.api.post('/auth/register', data);
  }

  login(data: { email: string; password: string }) {
    return this.api.post('/auth/login', data);
  }

  verifyEmail(data: { email: string; otp: string }) {
  return this.api.post('/auth/verify-email', data);
}

  forgotPassword(data: { email: string }) {
    return this.api.post('/auth/forgot-password', data);
  }

  

  resetPassword(data: {
    email: string;
    token: string;
    newPassword: string;
  }) {
    return this.api.post('/auth/reset-password', data);
  }
  
}
