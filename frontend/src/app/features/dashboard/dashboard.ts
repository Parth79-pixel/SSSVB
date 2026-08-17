import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from './dashboard.service';
import { CategoryService } from '../products/product.service';
import { DashboardStats, RecentInvoice } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: DashboardStats | null = null;
  recentInvoices: RecentInvoice[] = [];
  loading = true;

  newCategoryName = '';
  isAddingCategory = false;
  categoryMessage = '';
  categoryError = '';

  constructor(
    private dashboardService: DashboardService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard stats failed:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    this.dashboardService.getRecentInvoices().subscribe({
      next: (data) => {
        this.recentInvoices = data.sort((a, b) => Number(a.id) - Number(b.id));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Recent invoices failed:', err);
        this.cdr.detectChanges();
      },
    });
  }

  onAddCategory() {
    const name = this.newCategoryName.trim();
    if (!name) {
      return;
    }

    this.isAddingCategory = true;
    this.categoryMessage = '';
    this.categoryError = '';

    this.categoryService.create(name).subscribe({
      next: () => {
        this.isAddingCategory = false;
        this.categoryMessage = 'Category "' + name + '" added successfully!';
        this.newCategoryName = '';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.categoryMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.isAddingCategory = false;
        this.categoryError = err?.error?.detail || 'Failed to add category.';
        this.cdr.detectChanges();
      },
    });
  }
}