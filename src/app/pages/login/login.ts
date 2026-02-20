import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  login(){
    this.auth.login(this.email,this.password)
    .then(()=> this.router.navigate(['/dashboard']))  // 🔥 login ke baad dashboard pe le jao
    .catch(err=> alert(err.message));
  }
  
}
