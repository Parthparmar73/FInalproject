import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';

import { AuthService } from '../services/auth.service';

const BACKEND_URL = 'http://localhost:5000';

export interface NavPackage {
  id?: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular: boolean;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  route?: string;
}

export interface NavDropItem {
  id?: string;
  label: string;
  route: string;
  icon?: string;
  description?: string;
  order?: number;
}

// Badge color → CSS class mapping
const BADGE_COLOR_MAP: Record<string, string> = {
  orange: 'orange',
  green:  'green',
  blue:   'blue',
  red:    'red',
  purple: 'purple',
  teal:   'teal',
  gold:   'gold',
};

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {

  // Auth
  isLoggedIn = false;
  userEmail: string | null = null;
  user: any = null;

  // Dropdown
  activeDropdown: string | null = null;

  // Contact popup
  showContactPopup = false;

  // Packages modal
  showPackagesModal = false;
  packages: NavPackage[] = [];
  pkgsLoading = false;
  pkgsError = '';

  // ── Dynamic Nav Items ─────────────────────────────────────────────────────
  navServices: NavDropItem[]   = [];
  navChallenges: NavDropItem[] = [];
  navIndustries: NavDropItem[] = [];
  navLoading = false;

  // Form
  contactForm!: FormGroup;

  constructor(
    private auth: Auth,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName:  ['', Validators.required],
      company:   ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      phone:     ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      service:   ['', Validators.required],
      message:   ['', [Validators.required, Validators.minLength(10)]],
    });

    this.authService.getUser().subscribe((user: User | null) => {
      this.isLoggedIn = !!user;
      this.userEmail = user?.email ?? null;
    });

    // Pre-fetch everything on load
    this.fetchPackages();
    this.fetchNavItems();
  }

  // ── NAV ITEMS (Services / Challenges / Industries) ────────────────────────

  fetchNavItems() {
    this.navLoading = true;
    const fetchCollection = (col: string): Promise<NavDropItem[]> =>
      fetch(`${BACKEND_URL}/admin/nav/${col}`)
        .then(r => r.json())
        .then((d: any) => d.success ? (d.items as NavDropItem[]).sort((a: any, b: any) => (a.order ?? 99) - (b.order ?? 99)) : [])
        .catch(() => []);

    Promise.all([
      fetchCollection('nav-services'),
      fetchCollection('nav-challenges'),
      fetchCollection('nav-industries'),
    ]).then(([services, challenges, industries]) => {
      this.navServices   = services;
      this.navChallenges = challenges;
      this.navIndustries = industries;
      this.navLoading    = false;
    });
  }

  navigateTo(route: string) {
    if (!route) return;
    // Absolute route (starts with /) or relative
    const path = route.startsWith('/') ? route : `/${route}`;
    this.router.navigate([path]);
    this.closeDropdown();
  }

  // ── PACKAGES ──────────────────────────────────────────────────────────────

  fetchPackages() {
    this.pkgsLoading = true;
    this.pkgsError   = '';
    fetch(`${BACKEND_URL}/admin/packages`)
      .then(r => r.json())
      .then((data: any) => {
        if (data.success) {
          this.packages = (data.packages as NavPackage[]).sort((a: any, b: any) =>
            (a.order ?? 99) - (b.order ?? 99)
          );
        } else {
          this.pkgsError = data.message || 'Failed to load packages.';
        }
        this.pkgsLoading = false;
      })
      .catch(() => {
        this.pkgsError = 'Server se connect nahi ho pa raha.';
        this.pkgsLoading = false;
      });
  }

  badgeClass(color: string): string {
    return BADGE_COLOR_MAP[color] || 'orange';
  }

  openPackagesModal() {
    this.showPackagesModal = true;
    this.fetchPackages();
  }

  closePackagesModal() {
    this.showPackagesModal = false;
  }

  goTo(route: string | undefined, pkg?: NavPackage) {
    this.closePackagesModal();
    if (pkg?.id) {
      this.router.navigate(['/package', pkg.id], { state: { pkg } });
      return;
    }
    if (route) this.router.navigate([route]);
  }

  getIconClass(pkg: NavPackage): string {
    const colorMap: Record<string, string> = {
      orange: 'ecom-icon',
      green:  'design-icon',
      blue:   'digital-icon',
      red:    'security-icon',
      purple: 'perf-icon',
      teal:   'mfg-icon',
      gold:   'auto-icon',
    };
    return colorMap[pkg.badgeColor || ''] || 'ecom-icon';
  }

  // ── DROPDOWN ──────────────────────────────────────────────────────────────

  openDropdown(menu: string) {
    this.activeDropdown = menu;
    // Refresh nav items every time dropdown opens so admin changes reflect
    if (menu === 'services') this.fetchNavItems();
  }
  closeDropdown() { this.activeDropdown = null; }

  // ── LEGACY HELPERS (kept for backward compatibility) ──────────────────────

  selectEcommerce()    { this.router.navigate(['/ecommerce']);      this.closeDropdown(); }
  selectDesignToHtml() { this.router.navigate(['/design-to-html']); this.closeDropdown(); }
  getQuote(service: any) { this.closeDropdown(); }
  handleNav(route: string) { this.router.navigate([`/${route}`]); this.closeDropdown(); }

  // ── CONTACT ───────────────────────────────────────────────────────────────

  openContactPopup()  { this.showContactPopup = true;  }
  closeContactPopup() { this.showContactPopup = false; }

  submitContactForm() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    alert('Message sent successfully!');
    this.contactForm.reset();
    this.closeContactPopup();
  }

  // ── LOGOUT ────────────────────────────────────────────────────────────────

  logout() {
    this.authService.logout().then(() => this.router.navigate(['/login']));
  }
}
