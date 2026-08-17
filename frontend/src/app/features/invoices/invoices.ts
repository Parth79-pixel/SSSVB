import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from './invoice.service';
import { ProductService } from '../products/product.service';
import { CustomerService } from '../customers/customer.service';
import { Product } from '../../core/models/product.model';
import { Customer } from '../../core/models/customer.model';

interface InvoiceRow {
  product_id: number | null;
  price: number;
  qty: number;
  stock: number;
  stockWarning: string;
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css',
})
export class Invoices implements OnInit {
  customers: Customer[] = [];
  activeProducts: Product[] = [];

  selectedCustomerId: number | null = null;
  selectedCustomerMobile = '';

  status = 'Paid';
  discount = 0;
  amountPaid = 0;

  rows: InvoiceRow[] = [];

  isSubmitting = false;
  errorMessage = '';
  successInvoiceId: number | null = null;

  constructor(
    private invoiceService: InvoiceService,
    private productService: ProductService,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.customerService.list().subscribe((c) => {
      this.customers = c;
      this.cdr.detectChanges();
    });

    this.productService.list(1, 1000).subscribe((res) => {
      this.activeProducts = res.items.filter((p) => p.status === 'active');
      this.cdr.detectChanges();
    });

    this.addRow();
  }

  onCustomerChange() {
    const customer = this.customers.find((c) => c.id === this.selectedCustomerId);
    this.selectedCustomerMobile = customer ? customer.mobile : '';
  }

  addRow() {
    this.rows.push({ product_id: null, price: 0, qty: 1, stock: 0, stockWarning: '' });
  }

  removeRow(index: number) {
    this.rows.splice(index, 1);
    this.syncStatusWithBalance();
  }

  onProductSelected(index: number, productId: string) {
    const id = productId ? Number(productId) : null;
    const product = this.activeProducts.find((p) => p.id === id);
    this.rows[index].product_id = id;
    this.rows[index].price = product ? Number(product.price) : 0;
    this.rows[index].stock = product ? product.stock : 0;
    this.checkStockWarning(index);
  }

  onQtyChanged(index: number, qty: number) {
    this.rows[index].qty = qty || 0;
    this.checkStockWarning(index);
    this.syncStatusWithBalance();
  }

  private checkStockWarning(index: number) {
    const row = this.rows[index];
    if (row.product_id && row.qty > row.stock) {
      row.stockWarning =
        'Only ' + row.stock + ' in stock. Reduce quantity.';
    } else {
      row.stockWarning = '';
    }
  }

  hasStockIssues(): boolean {
    return this.rows.some((r) => r.stockWarning);
  }

  onDiscountOrPaidChanged() {
    this.syncStatusWithBalance();
  }

  getSubtotal(): number {
    let sum = 0;
    for (const row of this.rows) {
      sum += row.price * row.qty;
    }
    return sum;
  }

  getGrandTotal(): number {
    return this.getSubtotal() - (this.discount || 0);
  }

  getBalanceDue(): number {
    return this.getGrandTotal() - (this.amountPaid || 0);
  }

  private syncStatusWithBalance() {
    if (this.status === 'Cancelled') return;

    const balance = this.getBalanceDue();
    if (balance > 0 && this.amountPaid > 0) {
      this.status = 'Unpaid';
    } else if (balance <= 0 && this.amountPaid > 0) {
      this.status = 'Paid';
    }
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.selectedCustomerId) {
      this.errorMessage = 'Please select a customer.';
      return;
    }

    const validRows = this.rows.filter((r) => r.product_id && r.qty > 0);
    if (validRows.length === 0) {
      this.errorMessage = 'Please add at least one product.';
      return;
    }

    if (this.hasStockIssues()) {
      this.errorMessage = 'One or more items exceed available stock. Please fix before saving.';
      return;
    }

    this.isSubmitting = true;

    this.invoiceService
      .create({
        customer_id: this.selectedCustomerId,
        status: this.status,
        discount: this.discount || 0,
        amount_paid: this.amountPaid || 0,
        balance_due: this.getBalanceDue(),
        items: validRows.map((r) => ({
          product_id: r.product_id!,
          qty: r.qty,
          price: r.price,
        })),
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.success) {
            this.successInvoiceId = res.invoice_id ?? null;
          } else {
            this.errorMessage = res.message || 'Failed to save invoice.';
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.detail || 'Failed to save invoice.';
          this.cdr.detectChanges();
        },
      });
  }

  resetForNewInvoice() {
    this.successInvoiceId = null;
    this.selectedCustomerId = null;
    this.selectedCustomerMobile = '';
    this.status = 'Paid';
    this.discount = 0;
    this.amountPaid = 0;
    this.rows = [];
    this.addRow();
    this.cdr.detectChanges();
  }

  printInvoice() {
    if (this.successInvoiceId) {
      window.open('/invoice-view/' + this.successInvoiceId, '_blank');
    }
  }
}