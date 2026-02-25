import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from './navbar/navbar';
import { Home } from './home/home';
import { Form } from './form/form';
import { Footer } from './footer/footer';


@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterOutlet,
    NavbarComponent,
    Home,
    Form,
    Footer
  ],

  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {}

