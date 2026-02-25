import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {

  // Services info (for Get Quote buttons)
  ecommerceService = {
    name: 'E-Commerce Website'
  };

  designToHtmlService = {
    name: 'Design to HTML'
  };

  // Auth status
  isLoggedIn = false;
  userEmail: string | null = null;

  // Auth
  user: any = null;

  // Dropdown
  activeDropdown: string | null = null;

  // Contact popup
  showContactPopup = false;

  // Form
  contactForm!: FormGroup;

  constructor(
    private auth: Auth,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    // Initialize contact form with validators
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', Validators.required],
      company: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      service: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.authService.getUser().subscribe((user: User | null) => {
      if (user) {
        this.isLoggedIn = true;
        this.userEmail = user.email;
      } else {
        this.isLoggedIn = false;
        this.userEmail = null;
      }
    });
  }


  // ================= DROPDOWN =================

  openDropdown(menu: string) {
    this.activeDropdown = menu;
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  // ================= NAV =================

  selectEcommerce() {
    this.router.navigate(['/ecommerce']);
    this.closeDropdown();
  }

  selectDesignToHtml() {
    this.router.navigate(['/design-to-html']);
    this.closeDropdown();
  }

  getQuote(service: any) {
    console.log('Get quote for:', service);
    this.closeDropdown();
  }

  handleNav(route: string) {
    this.router.navigate([`/${route}`]);
    this.closeDropdown();
  }

  // ================= CONTACT =================

  openContactPopup() {
    this.showContactPopup = true;
  }

  closeContactPopup() {
    this.showContactPopup = false;
  }

  submitContactForm() {

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    console.log(this.contactForm.value);

    alert('Message sent successfully!');

    this.contactForm.reset();

    this.closeContactPopup();
  }

  // ================= LOGOUT =================

  logout() {

    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });

  }

}
