import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';

// 🔥 ADD THESE
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule   // 🔥 ADD THIS
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {

  activeDropdown: string | null = null;
  showContactPopup = false;

  // 🔥 LOGIN STATE
  userEmail: string | null = null;
  isLoggedIn = false;

  // 🔥 CONTACT FORM
  contactForm!: FormGroup;

  ecommerceService = {
    name: 'E-commerce Solution'
  };

  designToHtmlService = {
    name: 'Design to HTML'
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private fb: FormBuilder   // 🔥 ADD THIS
  ) {}

  // 🔥 SESSION CHECK
  ngOnInit() {

    this.auth.getUser().subscribe(user => {
  
      if (user) {
        this.isLoggedIn = true;
        this.userEmail = user.email;
      } else {
        this.isLoggedIn = false;
        this.userEmail = null;
      }
  
    });

    // 🔥 INIT CONTACT FORM
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', Validators.required],
      company: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      service: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

  }

  // 🔥 LOGOUT
  logout() {
    this.auth.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  /* ---------------- DROPDOWNS ---------------- */

  openDropdown(menu: string) {
    this.activeDropdown = menu;
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  /* ---------------- NAVIGATION ---------------- */

  selectEcommerce() {
    this.router.navigate(['/ecommerce']);
    this.closeDropdown();
  }

  selectDesignToHtml() {
    this.router.navigate(['/design-to-html']);
    this.closeDropdown();
  }

  getQuote(service: any) {
    console.log('Get quote for:', service.name);
    this.closeDropdown();
  }

  handleNav(route: string) {
    this.router.navigate([`/${route}`]);
    this.closeDropdown();
  }

  /* ---------------- CONTACT POPUP ---------------- */

  openContactPopup() {
    this.showContactPopup = true;
  }

  closeContactPopup() {
    this.showContactPopup = false;
  }

  // 🔥 FORM SUBMIT
  submitContactForm() {

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    console.log(this.contactForm.value);

    alert('Form Submitted Successfully ✅');

    this.contactForm.reset();
    this.closeContactPopup();
  }
}
