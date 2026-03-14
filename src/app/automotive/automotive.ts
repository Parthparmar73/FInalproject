import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { PaymentModalComponent } from '../payment-modal/payment-modal';
import { CustomQuoteComponent } from '../custom-quote/custom-quote';

interface PkgState {
  id?: string; name?: string; price?: number; duration?: string;
  features?: string[]; popular?: boolean; icon?: string;
  badge?: string; badgeColor?: string; description?: string; route?: string;
}

@Component({
  selector: 'app-automotive',
  imports: [RouterModule, CommonModule, PaymentModalComponent, CustomQuoteComponent],
  templateUrl: './automotive.html',
  styleUrl: './automotive.css',
})
export class Automotive {
  showPayment = false;
  showQuote = false;

  readonly defaultName     = 'Automotive';
  readonly defaultIcon     = '🚗';
  readonly defaultFeatures = ['Fleet Management', 'Dealer Portal', 'Telematics Integration'];
  readonly defaultPrice    = 7500;
  readonly defaultDuration = 'One-time';

  pkg: PkgState = {};

  constructor(private auth: Auth, private router: Router) {
    const nav   = this.router.getCurrentNavigation();
    const state = nav?.extras?.state?.['pkg'] || window?.history?.state?.['pkg'];
    if (state) { this.pkg = typeof state === 'string' ? JSON.parse(state) : state; }
  }

  get pkgName()     { return this.pkg.name     || this.defaultName; }
  get pkgIcon()     { return this.pkg.icon     || this.defaultIcon; }
  get pkgFeatures() { return this.pkg.features?.length ? this.pkg.features : this.defaultFeatures; }
  get pkgPrice()    { const p = this.pkg.price ?? this.defaultPrice; return `₹${p.toLocaleString('en-IN')}`; }
  get pkgDuration() { return this.pkg.duration || this.defaultDuration; }
  get pkgBadge()    { return this.pkg.badge || ''; }
  get pkgPopular()  { return this.pkg.popular || false; }
  get pkgDesc()     { return this.pkg.description || 'Digital solutions for automotive industry — from dealer portals to fleet management.'; }
  get pkgDisplayId() { return 'PR_' + this.pkgName.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 20); }
  get iconGradient(): string {
    const map: Record<string, string> = {
      orange: 'linear-gradient(135deg,#ff7a18,#ff3d00)', green: 'linear-gradient(135deg,#2ecc71,#27ae60)',
      blue: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',   red: 'linear-gradient(135deg,#ef4444,#b91c1c)',
      purple: 'linear-gradient(135deg,#a855f7,#7c3aed)', teal: 'linear-gradient(135deg,#0891b2,#0e7490)',
      gold: 'linear-gradient(135deg,#f59e0b,#b45309)',
    };
    return map[this.pkg.badgeColor || ''] || 'linear-gradient(135deg,#f59e0b,#b45309)';
  }

  openPayment() {
    if (this.auth.currentUser) { this.showPayment = true; }
    else { this.router.navigate(['/login']); }
  }
}
