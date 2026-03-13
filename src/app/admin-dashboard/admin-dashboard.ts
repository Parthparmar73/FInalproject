import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const BACKEND_URL = 'http://localhost:5000';

interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  createdAt: string;
  lastSignIn: string;
}

interface ContactMessage {
  id: string;
  fname: string;
  lname: string;
  cname: string;
  email: string;
  number: string;
  service: string;
  message: string;
  createdAt: string;
}

interface ServicePackage {
  id?: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular: boolean;
}

interface NavItem {
  id?: string;
  label: string;
  route: string;
  icon: string;
  description: string;
  order?: number;
}

interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  packageName: string;
  message: string;
  status: string;
  createdAt: string;
}

type NavCollection = 'nav-services' | 'nav-challenges' | 'nav-industries';

type SettingsSubTab = 'packages' | 'services' | 'challenges' | 'industries';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  private readonly ADMIN_EMAIL = 'admin@pixelroot.com';

  activeTab: 'dashboard' | 'users' | 'messages' | 'quotes' | 'settings' = 'dashboard';
  settingsSubTab: SettingsSubTab = 'packages';

  // Users
  users: FirebaseUser[] = [];
  filteredUsers: FirebaseUser[] = [];
  isLoading = true;
  errorMsg = '';
  searchQuery = '';

  // Messages
  messages: ContactMessage[] = [];
  filteredMessages: ContactMessage[] = []  ;
  msgsLoading = false;
  msgsError = '';
  msgSearch = '';
  expandedMsg: string | null = null;

  // Quote Requests
  quotes: QuoteRequest[] = [];
  quotesLoading = false;
  quotesError = '';

  // Packages (Settings tab)
  packages: ServicePackage[] = [];
  pkgLoading = false;
  pkgError = '';
  showPkgForm = false;
  editingPkg: ServicePackage | null = null;
  pkgSaving = false;

  pkgForm: ServicePackage = {
    name: '',
    price: 0,
    duration: '',
    features: [],
    popular: false
  };
  pkgFeaturesText = ''; // multiline textarea for features

  // Nav Items (Services / Challenges / Industries)
  navServices: NavItem[] = [];
  navChallenges: NavItem[] = [];
  navIndustries: NavItem[] = [];
  navLoading: { [k in NavCollection]?: boolean } = {};
  navError: { [k in NavCollection]?: string } = {};

  showNavForm = false;
  editingNavItem: NavItem | null = null;
  activeNavCollection: NavCollection = 'nav-services';
  navSaving = false;
  navForm: NavItem = { label: '', route: '', icon: '🔹', description: '' };

  constructor(
    private fireAuth: Auth,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.fetchUsers();
    this.fetchMessages();
  }

  setTab(tab: 'dashboard' | 'users' | 'messages' | 'quotes' | 'settings') {
    this.activeTab = tab;
    this.cdr.detectChanges();
    if (tab === 'users' && this.users.length === 0) this.fetchUsers();
    if (tab === 'messages' && this.messages.length === 0) this.fetchMessages();
    if (tab === 'quotes' && this.quotes.length === 0) this.fetchQuotes();
    if (tab === 'settings') {
      if (this.packages.length === 0) this.fetchPackages();
      if (this.navServices.length === 0) this.fetchNavItems('nav-services');
      if (this.navChallenges.length === 0) this.fetchNavItems('nav-challenges');
      if (this.navIndustries.length === 0) this.fetchNavItems('nav-industries');
    }
  }

  setSettingsSubTab(sub: SettingsSubTab) {
    this.settingsSubTab = sub;
    this.cdr.detectChanges();
  }

  refreshMessages() {
    this.fetchMessages();
  }

  get verifiedUsersCount(): number {
    return this.users.filter(u => u.emailVerified).length;
  }

  isAdmin(email: string): boolean {
    return email.toLowerCase() === this.ADMIN_EMAIL;
  }

  deleteUser(uid: string, email: string) {
    if (!confirm(`❗ "${email}" ko permanently delete karna chahte ho?\n\nYe action undo nahi ho sakta!`)) return;
    fetch(`${BACKEND_URL}/admin/delete-user/${uid}`, { method: 'DELETE' })
      .then(res => res.json())
      .then((data: any) => {
        if (data.success) {
          this.users = this.users.filter(u => u.uid !== uid);
          this.filteredUsers = this.filteredUsers.filter(u => u.uid !== uid);
        } else {
          alert('Delete failed: ' + (data.message || 'Unknown error'));
        }
        this.cdr.detectChanges();
      })
      .catch(() => {
        alert('Backend se connect nahi ho pa raha.');
      });
  }

  deleteMessage(id: string, name: string) {
    if (!confirm(`❗ "${name}" ka message permanently delete karna chahte ho?\n\nYe action undo nahi ho sakta!`)) return;
    fetch(`${BACKEND_URL}/admin/delete-message/${id}`, { method: 'POST' })
      .then(res => res.json())
      .then((data: any) => {
        if (data.success) {
          this.messages = this.messages.filter(m => m.id !== id);
          this.filteredMessages = this.filteredMessages.filter(m => m.id !== id);
        } else {
          alert('Delete failed: ' + (data.message || 'Unknown error'));
        }
        this.cdr.detectChanges();
      })
      .catch(() => {
        alert('Backend se connect nahi ho pa raha.');
      });
  }


  fetchUsers() {
    this.isLoading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    fetch(`${BACKEND_URL}/admin/users`)
      .then(res => res.json())
      .then((data: any) => {
        if (data.success) {
          this.users = data.users;
          this.filteredUsers = data.users;
        } else {
          this.errorMsg = data.message || 'Failed to load users.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.errorMsg = 'Backend se connect nahi ho pa raha.';
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  fetchMessages() {
    this.msgsLoading = true;
    this.msgsError = '';
    this.cdr.detectChanges();

    fetch(`${BACKEND_URL}/admin/messages`)
      .then(res => res.json())
      .then((data: any) => {
        if (data.success) {
          this.messages = data.messages;
          this.filteredMessages = data.messages;
        } else {
          this.msgsError = data.message || 'Failed to load messages.';
        }
        this.msgsLoading = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.msgsError = 'Backend se connect nahi ho pa raha.';
        this.msgsLoading = false;
        this.cdr.detectChanges();
      });
  }

  // ─── Package Methods ─────────────────────────────────────────────────────────

  fetchPackages() {
    this.pkgLoading = true;
    this.pkgError = '';
    this.cdr.detectChanges();

    fetch(`${BACKEND_URL}/admin/packages`)
      .then(res => res.json())
      .then((data: any) => {
        if (data.success) {
          this.packages = data.packages;
        } else {
          this.pkgError = data.message || 'Failed to load packages.';
        }
        this.pkgLoading = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.pkgError = 'Backend se connect nahi ho pa raha.';
        this.pkgLoading = false;
        this.cdr.detectChanges();
      });
  }

  openAddPackage() {
    this.editingPkg = null;
    this.pkgForm = { name: '', price: 0, duration: '', features: [], popular: false };
    this.pkgFeaturesText = '';
    this.showPkgForm = true;
    this.cdr.detectChanges();
  }

  openEditPackage(pkg: ServicePackage) {
    this.editingPkg = pkg;
    this.pkgForm = { ...pkg, features: [...(pkg.features || [])] };
    this.pkgFeaturesText = (pkg.features || []).join('\n');
    this.showPkgForm = true;
    this.cdr.detectChanges();
  }

  cancelPkgForm() {
    this.showPkgForm = false;
    this.editingPkg = null;
    this.cdr.detectChanges();
  }

  savePkg() {
    if (!this.pkgForm.name.trim() || !this.pkgForm.price) {
      alert('Package name aur price required hain!');
      return;
    }

    const featuresArr = this.pkgFeaturesText
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    const payload = {
      name: this.pkgForm.name.trim(),
      price: Number(this.pkgForm.price),
      duration: this.pkgForm.duration.trim(),
      features: featuresArr,
      popular: this.pkgForm.popular
    };

    this.pkgSaving = true;
    this.cdr.detectChanges();

    const isEdit = !!this.editingPkg?.id;
    const url = isEdit
      ? `${BACKEND_URL}/admin/packages/${this.editingPkg!.id}`
      : `${BACKEND_URL}/admin/packages`;
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then((data: any) => {
        if (data.success) {
          this.showPkgForm = false;
          this.editingPkg = null;
          this.fetchPackages();
        } else {
          alert('Error: ' + (data.message || 'Failed to save package.'));
        }
        this.pkgSaving = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        alert('Backend se connect nahi ho pa raha.');
        this.pkgSaving = false;
        this.cdr.detectChanges();
      });
  }

  deletePackage(pkg: ServicePackage) {
    if (!confirm(`❗ "${pkg.name}" package delete karna chahte ho?\n\nYe action undo nahi ho sakta!`)) return;

    fetch(`${BACKEND_URL}/admin/packages/${pkg.id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then((data: any) => {
        if (data.success) {
          this.packages = this.packages.filter(p => p.id !== pkg.id);
        } else {
          alert('Delete failed: ' + (data.message || 'Unknown error'));
        }
        this.cdr.detectChanges();
      })
      .catch(() => {
        alert('Backend se connect nahi ho pa raha.');
      });
  }

  // ─── Nav Items CRUD ───────────────────────────────────────────────────────────

  navItemsFor(col: NavCollection): NavItem[] {
    if (col === 'nav-services') return this.navServices;
    if (col === 'nav-challenges') return this.navChallenges;
    return this.navIndustries;
  }

  private setNavItems(col: NavCollection, items: NavItem[]) {
    if (col === 'nav-services') this.navServices = items;
    else if (col === 'nav-challenges') this.navChallenges = items;
    else this.navIndustries = items;
  }

  fetchNavItems(col: NavCollection) {
    this.navLoading[col] = true;
    this.navError[col] = '';
    this.cdr.detectChanges();
    fetch(`${BACKEND_URL}/admin/nav/${col}`)
      .then(r => r.json())
      .then((data: any) => {
        if (data.success) this.setNavItems(col, data.items);
        else this.navError[col] = data.message || 'Failed to load.';
        this.navLoading[col] = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.navError[col] = 'Backend se connect nahi ho pa raha.';
        this.navLoading[col] = false;
        this.cdr.detectChanges();
      });
  }

  openAddNavItem(col: NavCollection) {
    this.activeNavCollection = col;
    this.editingNavItem = null;
    this.navForm = { label: '', route: '', icon: '🔹', description: '' };
    this.showNavForm = true;
    this.cdr.detectChanges();
  }

  openEditNavItem(col: NavCollection, item: NavItem) {
    this.activeNavCollection = col;
    this.editingNavItem = item;
    this.navForm = { ...item };
    this.showNavForm = true;
    this.cdr.detectChanges();
  }

  cancelNavForm() {
    this.showNavForm = false;
    this.editingNavItem = null;
    this.cdr.detectChanges();
  }

  saveNavItem() {
    if (!this.navForm.label.trim() || !this.navForm.route.trim()) {
      alert('Label aur Route required hain!');
      return;
    }
    this.navSaving = true;
    this.cdr.detectChanges();
    const col = this.activeNavCollection;
    const isEdit = !!this.editingNavItem?.id;
    const url = isEdit
      ? `${BACKEND_URL}/admin/nav/${col}/${this.editingNavItem!.id}`
      : `${BACKEND_URL}/admin/nav/${col}`;
    fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.navForm)
    })
      .then(r => r.json())
      .then((data: any) => {
        if (data.success) {
          this.showNavForm = false;
          this.editingNavItem = null;
          this.fetchNavItems(col);
        } else {
          alert('Error: ' + (data.message || 'Failed to save.'));
        }
        this.navSaving = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        alert('Backend se connect nahi ho pa raha.');
        this.navSaving = false;
        this.cdr.detectChanges();
      });
  }

  deleteNavItem(col: NavCollection, item: NavItem) {
    if (!confirm(`❗ "${item.label}" delete karna chahte ho?`)) return;
    fetch(`${BACKEND_URL}/admin/nav/${col}/${item.id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then((data: any) => {
        if (data.success) this.fetchNavItems(col);
        else alert('Delete failed: ' + (data.message || ''));
        this.cdr.detectChanges();
      })
      .catch(() => alert('Backend se connect nahi ho pa raha.'));
  }

  // ─── Search ──────────────────────────────────────────────────────────────────

  onSearch() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredUsers = !q
      ? this.users
      : this.users.filter(u =>
        u.email.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q)
      );
  }

  onMsgSearch() {
    const q = this.msgSearch.toLowerCase().trim();
    this.filteredMessages = !q
      ? this.messages
      : this.messages.filter(m =>
        m.email?.toLowerCase().includes(q) ||
        m.fname?.toLowerCase().includes(q) ||
        m.lname?.toLowerCase().includes(q) ||
        m.cname?.toLowerCase().includes(q) ||
        m.service?.toLowerCase().includes(q)
      );
  }

  toggleMsg(id: string) {
    this.expandedMsg = this.expandedMsg === id ? null : id;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }


  signOut() {
    signOut(this.fireAuth).then(() => this.router.navigate(['/login']));
  }

  // ── QUOTES ────────────────────────────────────────────────────────────────

  fetchQuotes() {
    this.quotesLoading = true;
    this.quotesError = '';
    fetch(`${BACKEND_URL}/admin/quotes`)
      .then(r => r.json())
      .then((data: any) => {
        if (data.success) {
          this.quotes = data.quotes;
        } else {
          this.quotesError = data.message || 'Fetch failed.';
        }
        this.quotesLoading = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.quotesError = 'Server se connect nahi ho pa raha.';
        this.quotesLoading = false;
        this.cdr.detectChanges();
      });
  }

  deleteQuote(quote: QuoteRequest) {
    if (!confirm(`"${quote.name}" ka quote delete karein?`)) return;
    fetch(`${BACKEND_URL}/admin/quotes/${quote.id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then((data: any) => {
        if (data.success) {
          this.quotes = this.quotes.filter(q => q.id !== quote.id);
          this.cdr.detectChanges();
        }
      });
  }
}

