import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html'
})

export class RegisterComponent {

  firstName = '';
  lastName = '';
  email = '';
  password = '';

  success = '';
  error = '';

  constructor(
  private auth: AuthService,
  private router: Router
) {}

register() {
  this.auth.register({
    fullName: `${this.firstName} ${this.lastName}`.trim(),
    email: this.email,
    password: this.password
  }).subscribe({
    next: () => {
      // store email temporarily
      localStorage.setItem('verifyEmail', this.email);

      // redirect to verify email page
      this.router.navigate(['/auth/verify-email']);
    },
    error: err => {
      this.error = err.error?.message || 'Registration failed';
    }
  });
  }
}
