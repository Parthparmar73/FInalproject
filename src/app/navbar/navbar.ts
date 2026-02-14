import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {

  activeDropdown: string | null = null;

  // 🔥 CONTACT POPUP STATE
  showContactPopup = false;

  ecommerceService = {
    name: 'E-commerce Solution'
  };

  designToHtmlService = {
    name: 'Design to HTML'
  };

  constructor(private router: Router) {}

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
