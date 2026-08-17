import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Products', path: '/products', icon: '📦' },
    { label: 'Invoices', path: '/invoices', icon: '🧾' },
    { label: 'Manage Invoices', path: '/manage-invoices', icon: '📄' },
    { label: 'Customers', path: '/customers', icon: '👥' },
    { label: 'Reports', path: '/reports', icon: '📈' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  constructor(public layout: LayoutService) {}

  onNavClick(): void {
    this.layout.closeSidebar();
  }
}