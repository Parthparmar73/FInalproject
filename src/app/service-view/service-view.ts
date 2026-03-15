import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { PaymentModalComponent } from '../payment-modal/payment-modal';
import { CustomQuoteComponent } from '../custom-quote/custom-quote';

const BACKEND_URL = 'http://localhost:5000';

export interface ServiceItem {
  id?: string;
  label?: string;
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
  selector: 'app-service-view',
  standalone: true,
  imports: [RouterModule, CommonModule, PaymentModalComponent, CustomQuoteComponent],
  templateUrl: './service-view.html',
  styleUrl: './service-view.css',
})
export class ServiceView implements OnInit, OnDestroy {
  item: ServiceItem | null = null;
  loading = true;
  error = '';
  showPayment = false;
  showQuote = false;
  currentUserEmail = '';

  private routerState: ServiceItem | null = null;
  private paramSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: Auth
  ) {
    // Must read router state in constructor
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state?.['pkg'];
    if (state) {
      this.routerState = typeof state === 'string' ? JSON.parse(state) : state;
    }
  }

  ngOnInit() {
    this.paramSub = this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || '';
      this.item = null;
      this.error = '';
      this.showPayment = false;
      this.loading = true;

      // 1️⃣ Use router state instantly (no fetch needed)
      if (this.routerState) {
        this.item = { ...this.routerState };
        this.loading = false;
        this.routerState = null;
        return;
      }

      // 2️⃣ Check window.history.state (survives refresh)
      const histState = window.history.state?.['pkg'];
      if (histState) {
        this.item = typeof histState === 'string' ? JSON.parse(histState) : histState;
        this.loading = false;
        return;
      }

      // 3️⃣ Fetch from backend by route slug
      if (slug) {
        this.fetchBySlug(slug);
      } else {
        this.error = 'Service nahi mila.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
  }

  fetchBySlug(slug: string) {
    this.loading = true;
    this.error = '';
    fetch(`${BACKEND_URL}/nav-service-by-route?route=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then((data: any) => {
        if (data.success && data.item) {
          this.item = data.item;
        } else {
          this.error = 'Ye service admin ne abhi add nahi ki hai.';
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
      this.currentUserEmail = this.auth.currentUser.email || '';
      this.showPayment = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  get displayName(): string {
    return this.item?.label || this.item?.name || 'Service';
  }

  get priceFormatted(): string {
    if (!this.item?.price) return '₹0';
    return `₹${this.item.price.toLocaleString('en-IN')}`;
  }

  get pkgDisplayId(): string {
    return 'PR_' + this.displayName.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 20);
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
    return map[this.item?.badgeColor || ''] || 'linear-gradient(135deg,#1FD1C2,#14B8A6)';
  }
}
