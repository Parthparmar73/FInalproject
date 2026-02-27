import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  private readonly ADMIN_EMAIL = 'admin@pixelroot.com';

  activeTab: 'dashboard' | 'users' | 'messages' = 'dashboard';

  // Users
  users: FirebaseUser[] = [];
  filteredUsers: FirebaseUser[] = [];
  isLoading = true;
  errorMsg = '';
  searchQuery = '';

  // Messages
  messages: ContactMessage[] = [];
  filteredMessages: ContactMessage[] = [];
  msgsLoading = false;
  msgsError = '';
  msgSearch = '';
  expandedMsg: string | null = null;

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

  setTab(tab: 'dashboard' | 'users' | 'messages') {
    this.activeTab = tab;
    this.cdr.detectChanges();
    if (tab === 'users' && this.users.length === 0) this.fetchUsers();
    if (tab === 'messages' && this.messages.length === 0) this.fetchMessages();
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
}
