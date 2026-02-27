import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from './navbar/navbar';
import { Home } from './home/home';
import { Form } from './form/form';
import { Footer } from './footer/footer';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterOutlet,
    NavbarComponent,
    Home,
    Form,
    Footer,
    CommonModule
  ],

  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  constructor(public router: Router) { }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin-dashboard');
  }
}

