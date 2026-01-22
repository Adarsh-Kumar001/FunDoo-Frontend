import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],   
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent {

  otp = '';
  email = localStorage.getItem('verifyEmail') || '';
  error = '';
  success = '';

  constructor(private auth: AuthService, private router: Router) {}

 verify() {
  console.log('Email:', this.email);
  console.log('OTP:', this.otp);

  this.auth.verifyEmail({
    email: this.email.trim(),
    otp: this.otp.trim()
  }).subscribe({
    next: () => {
      this.router.navigate(['/auth/login']);
    },
    error: err => {
      console.error(err);
      this.error = 'Invalid or expired OTP';
    }
  });
  }
}
