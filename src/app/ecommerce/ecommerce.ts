import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { PaymentModalComponent } from '../payment-modal/payment-modal';
import { CustomQuoteComponent } from '../custom-quote/custom-quote';

const BACKEND_URL = 'http://localhost:5000';
const MY_ROUTE = 'ecommerce'; // must match Firestore nav-services route field

interface PkgState {
  id?: string;
  name?: string;
  price?: number;
  duration?: string;
  features?: string[];
  popular?: boolean;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  route?: string;
}

@Component({
  selector: 'app-ecommerce',
  imports: [RouterModule, CommonModule, PaymentModalComponent, CustomQuoteComponent],
  templateUrl: './ecommerce.html',
  styleUrl: './ecommerce.css',
})
export class Ecommerce implements OnInit {
  showPayment = false;
  showQuote = false;
  pkgLoaded = false;

  // Static defaults (used if nothing found in admin)
  readonly defaultName     = 'E-commerce Development';
  readonly defaultIcon     = '🛒';
  readonly defaultFeatures = ['Custom Checkout', 'Inventory Management', 'Multi-currency Support'];
  readonly defaultPrice    = 3500;
  readonly defaultDuration = 'One-time';

  pkg: PkgState = {};

  constructor(private auth: Auth, private router: Router, private cdr: ChangeDetectorRef) {
    const nav   = this.router.getCurrentNavigation();
    const state = nav?.extras?.state?.['pkg'] || window?.history?.state?.['pkg'];
    if (state) {
      this.pkg = typeof state === 'string' ? JSON.parse(state) : state;
      this.pkgLoaded = true;
    }
  }

  ngOnInit() {
    // If no router state, fetch from admin-managed nav-services
    if (!this.pkgLoaded) {
      fetch(`${BACKEND_URL}/nav-service-by-route?route=${MY_ROUTE}`)
        .then(r => r.json())
        .then((data: any) => {
          if (data.success && data.item) {
            this.pkg = data.item;
          }
          this.pkgLoaded = true;
          this.cdr.detectChanges();
        })
        .catch(() => { this.pkgLoaded = true; this.cdr.detectChanges(); });
    }
  }

  get pkgName()     { return this.pkg.name     || this.defaultName; }
  get pkgIcon()     { return this.pkg.icon     || this.defaultIcon; }
  get pkgFeatures() { return this.pkg.features?.length ? this.pkg.features : this.defaultFeatures; }
  get pkgPrice()    {
    const p = this.pkg.price ?? this.defaultPrice;
    return `₹${p.toLocaleString('en-IN')}`;
  }
  get pkgDuration() { return this.pkg.duration || this.defaultDuration; }
  get pkgBadge()    { return this.pkg.badge || ''; }
  get pkgPopular()  { return this.pkg.popular || false; }
  get pkgDesc()     { return this.pkg.description || 'End-to-end e-commerce solutions built for conversion and high traffic.'; }
  get pkgDisplayId() {
    return 'PR_' + this.pkgName.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 20);
  }
  get iconGradient(): string {
    const map: Record<string, string> = {
      orange: 'linear-gradient(135deg,#ff7a18,#ff3d00)',
      green:  'linear-gradient(135deg,#2ecc71,#27ae60)',
      blue:   'linear-gradient(135deg,#3b82f6,#1d4ed8)',
      red:    'linear-gradient(135deg,#ef4444,#b91c1c)',
      purple: 'linear-gradient(135deg,#a855f7,#7c3aed)',
      teal:   'linear-gradient(135deg,#0891b2,#0e7490)',
      gold:   'linear-gradient(135deg,#f59e0b,#b45309)',
    };
    return map[this.pkg.badgeColor || ''] || 'linear-gradient(135deg,#ff7a18,#ff3d00)';
  }

  openPayment() {
    if (this.auth.currentUser) {
      this.showPayment = true;
    } else {
      this.router.navigate(['/login']);
    }
  }
}
