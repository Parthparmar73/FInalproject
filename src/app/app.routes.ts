import { AuthGuard } from './guards/auth.guards'; // 👈 import AuthGuard
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { Routes } from '@angular/router';
import { Home } from './home/home'; // agar home component hai
import { Ecommerce } from './ecommerce/ecommerce';
import { DesignToHtml } from './design-to-html/design-to-html';
import { Digitaltransformation } from './digitaltransformation/digitaltransformation';
import { Security } from './security/security';
import { Performance } from './performance/performance';
import { Manufacturing } from './manufacturing/manufacturing';
import { Automotive } from './automotive/automotive';
import { RetailEcom } from './retail-ecom/retail-ecom';
import { Team } from './team/team';
import { Careers } from './careers/careers';
import { Aboutus } from './aboutus/aboutus';
import { Form } from './form/form'; // agar form component hai
import { Register } from './pages/register/register'; // agar register component hai  
import { AdminDashboard } from './admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },   // 👈 yaha shift karo
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin-dashboard', component: AdminDashboard, canActivate: [AuthGuard] },

  { path: '', component: Home },

  { path: 'ecommerce', component: Ecommerce },
  { path: 'design-to-html', component: DesignToHtml },
  { path: 'digitaltransformation', component: Digitaltransformation },
  { path: 'security', component: Security },
  { path: 'performance', component: Performance },
  { path: 'manufacturing', component: Manufacturing },
  { path: 'automotive', component: Automotive },
  { path: 'retail-ecommerce', component: RetailEcom },
  { path: 'team', component: Team },
  { path: 'careers', component: Careers },
  { path: 'aboutus', component: Aboutus },
  { path: 'form', component: Form },

  { path: '**', redirectTo: 'login' }  // 👈 ALWAYS LAST
];

