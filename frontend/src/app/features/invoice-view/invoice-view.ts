import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../invoices/invoice.service';
import { SettingsService } from '../settings/settings.service';
import { InvoiceRead } from '../../core/models/invoice.model';
import { ShopSettings } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-view.html',
  styleUrl: './invoice-view.css',
})
export class InvoiceView implements OnInit {
  invoice: InvoiceRead | null = null;
  shop: ShopSettings | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Invalid invoice ID.';
      this.loading = false;
      return;
    }

    this.invoiceService.getFull(id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.loadShopSettings();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.status === 404 ? 'Invoice not found.' : 'Failed to load invoice.';
        this.cdr.detectChanges();
      },
    });
  }

  loadShopSettings() {
    this.settingsService.get().subscribe({
      next: (shop) => {
        this.shop = shop;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load shop settings.';
        this.cdr.detectChanges();
      },
    });
  }

  getSubtotal(): number {
    if (!this.invoice) return 0;
    return Number(this.invoice.final_amount) + Number(this.invoice.discount);
  }

  print() {
    window.print();
  }
}