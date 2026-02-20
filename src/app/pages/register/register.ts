import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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
){}
  register() {
    this.auth.register(this.email,this.password)
    .then(() => {alert("Registered Successfully");
      this.router.navigate(['/login']);
  })
    .catch((err: any)=> {
      alert(err.message);
      console.log(err);
    });
    }
  }

