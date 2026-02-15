import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule   // 🔥 routerLink ke liye important
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  message: string = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login() {

    if (!this.email || !this.password) {
      alert('Please fill all fields');
      return;
    }

    this.auth.login(this.email, this.password)
      .then(() => {
        // login success
        this.router.navigate(['/dashboard']);  // 👈 better than '/'
      })
      .catch((err: any) => {
        alert(err?.message ?? err);
      });
  }
}
