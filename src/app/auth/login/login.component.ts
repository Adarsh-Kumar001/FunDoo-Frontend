import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private token: TokenService,
    private router: Router
  ) {}

  login() {
    this.auth.login({ email: this.email, password: this.password })
      .subscribe({
        next: res => {
          this.token.saveToken(res.token);
          this.router.navigate(['/notes']);
        },
        error: err => alert(err.error.message)
      });
  }
}
