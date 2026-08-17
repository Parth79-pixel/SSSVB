import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Shell } from './layout/shell/shell';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Products } from './features/products/products';
import { Customers } from './features/customers/customers';
import { Invoices } from './features/invoices/invoices';
import { ManageInvoices } from './features/manage-invoices/manage-invoices';
import { Reports } from './features/reports/reports';
import { Settings } from './features/settings/settings';
import { InvoiceView } from './features/invoice-view/invoice-view';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'invoice-view/:id', component: InvoiceView },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'products', component: Products },
      { path: 'invoices', component: Invoices },
      { path: 'manage-invoices', component: ManageInvoices },
      { path: 'customers', component: Customers },
      { path: 'reports', component: Reports },
      { path: 'settings', component: Settings },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];