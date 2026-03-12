import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { PaymentModalComponent } from '../payment-modal/payment-modal';
import { CustomQuoteComponent } from '../custom-quote/custom-quote';

const BACKEND_URL = 'http://localhost:5000';

interface PackageData {
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
  description?: string;
}

@Component({
  selector: 'app-package-detail',
  standalone: true,
  imports: [RouterModule, CommonModule, PaymentModalComponent, CustomQuoteComponent],
  templateUrl: './package-detail.html',
  styleUrl: './package-detail.css',
})
export class PackageDetail implements OnInit, OnDestroy {
  pkg: PackageData | null = null;
  loading = false;
  error = '';
  showPayment = false;
  showQuote = false;
  packageId = '';

  // ── Read router state in constructor — only HERE it is available ────────────
  private routerState: PackageData | null = null;
  private paramSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: Auth
  ) {
    // getCurrentNavigation() is only valid inside constructor
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state?.['pkg'];
    if (state) {
      this.routerState = typeof state === 'string' ? JSON.parse(state) : state;
    }
  }

  ngOnInit() {
    // Subscribe to paramMap so component reacts even when Angular reuses it
    this.paramSub = this.route.paramMap.subscribe(params => {
      this.packageId = params.get('id') || '';
      this.pkg = null;
      this.error = '';
      this.showPayment = false;

      // 1️⃣ Use router state if ID matches (instant — no fetch)
      if (this.routerState && this.routerState.id === this.packageId) {
        this.pkg = { ...this.routerState };
        this.loading = false;
        this.routerState = null; // consume it — next click must fetch fresh
        return;
      }

      // 2️⃣ Try window.history.state (survives page refresh)
      const histState = window.history.state?.['pkg'];
      if (histState) {
        const parsed: PackageData = typeof histState === 'string' ? JSON.parse(histState) : histState;
        if (parsed.id === this.packageId) {
          this.pkg = parsed;
          this.loading = false;
          return;
        }
      }

      // 3️⃣ Fallback: fetch from backend
      if (this.packageId) {
        this.fetchPackage();
      } else {
        this.error = 'Invalid package ID.';
      }
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
  }

  fetchPackage() {
    this.loading = true;
    this.error = '';
    fetch(`${BACKEND_URL}/admin/packages/${this.packageId}`)
      .then(r => r.json())
      .then((data: any) => {
        if (data.success) {
          this.pkg = data.package;
        } else {
          this.error = data.message || 'Package nahi mila.';
        }
        this.loading = false;
      })
      .catch(() => {
        this.error = 'Server se connect nahi ho pa raha. Backend chal raha hai?';
        this.loading = false;
      });
  }

  openPayment() {
    if (this.auth.currentUser) {
      this.showPayment = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  get priceFormatted(): string {
    if (!this.pkg) return '';
    return `\u20B9${this.pkg.price.toLocaleString('en-IN')}`;
  }

  get pkgDisplayId(): string {
    if (!this.pkg) return '';
    return 'PR_' + this.pkg.name.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 20);
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
    return map[this.pkg?.badgeColor || ''] || 'linear-gradient(135deg,#1FD1C2,#14B8A6)';
  }
}
