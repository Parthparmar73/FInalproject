import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {

  activeDropdown: string | null = null;

  showContactPopup = false;

  // 🔥 LOGIN STATE
  userEmail: string | null = null;
  isLoggedIn = false;

  ecommerceService = {
    name: 'E-commerce Solution'
  };

  designToHtmlService = {
    name: 'Design to HTML'
  };

  constructor(
    private router: Router,
    private auth: AuthService
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
}
