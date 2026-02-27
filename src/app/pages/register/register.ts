import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const BACKEND_URL = 'http://localhost:5000';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  register() {
    this.auth.register(this.email, this.password)
      .then(() => {
        const emailLower = this.email.toLowerCase().trim();

        // Save email to backend local store (for forgot-password check)
        fetch(`${BACKEND_URL}/register-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailLower })
        }).catch(() => { });

        // Auto-verify email via Admin SDK so "Verified" shows in admin dashboard
        fetch(`${BACKEND_URL}/admin/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailLower })
        }).catch(() => { }); // Non-blocking

        alert('Registered Successfully');
        this.router.navigate(['/login']);
      })
      .catch((err: any) => {
        alert(err.message);
        console.log(err);
      });
  }
}
