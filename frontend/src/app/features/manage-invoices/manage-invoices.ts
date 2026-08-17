import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../invoices/invoice.service';
import { InvoiceListItem, InvoiceSummary, InvoiceRead } from '../../core/models/invoice.model';

@Component({
  selector: 'app-manage-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-invoices.html',
  styleUrl: './manage-invoices.css',
})
export class ManageInvoices implements OnInit {
  invoices: InvoiceListItem[] = [];
  loading = true;

  editingId: number | null = null;
  editFinalAmount = 0;
  editForm = {
    customer_name: '',
    customer_mobile: '',
    status: 'Paid',
    amount_paid: 0,
    balance_due: 0,
  };

  deleteTarget: InvoiceListItem | null = null;

  sendingWhatsappId: number | null = null;

  constructor(
    private invoiceService: InvoiceService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    this.invoiceService.list().subscribe((list) => {
      this.invoices = list;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  getExportUrl(): string {
    return this.invoiceService.exportCsvUrl();
  }

  openEdit(invoice: InvoiceListItem) {
    this.editingId = invoice.id;
    this.invoiceService.getSummary(invoice.id).subscribe((s: InvoiceSummary) => {
      this.editFinalAmount = Number(s.final_amount);
      this.editForm = {
        customer_name: s.customer_name,
        customer_mobile: s.customer_mobile,
        status: s.status,
        amount_paid: Number(s.amount_paid),
        balance_due: Number(s.balance_due),
      };
      this.cdr.detectChanges();
    });
  }

  closeEdit() {
    this.editingId = null;
    this.cdr.detectChanges();
  }

  onAmountPaidChanged() {
    const paid = this.editForm.amount_paid || 0;
    this.editForm.balance_due = this.editFinalAmount - paid;
    this.syncEditStatus();
  }

  onBalanceDueChanged() {
    const balance = this.editForm.balance_due || 0;
    this.editForm.amount_paid = this.editFinalAmount - balance;
    this.syncEditStatus();
  }

  private syncEditStatus() {
    if (this.editForm.status === 'Cancelled') return;

    if (this.editForm.balance_due > 0 && this.editForm.amount_paid > 0) {
      this.editForm.status = 'Unpaid';
    } else if (this.editForm.balance_due <= 0 && this.editForm.amount_paid > 0) {
      this.editForm.status = 'Paid';
    }
  }

  onEditSubmit() {
    if (!this.editingId) return;

    this.invoiceService.update(this.editingId, this.editForm).subscribe(() => {
      this.closeEdit();
      this.loadInvoices();
      this.cdr.detectChanges();
    });
  }

  confirmDelete(invoice: InvoiceListItem) {
    this.deleteTarget = invoice;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.deleteTarget = null;
    this.cdr.detectChanges();
  }

  onConfirmDelete() {
    if (!this.deleteTarget) return;

    this.invoiceService.delete(this.deleteTarget.id).subscribe(() => {
      this.deleteTarget = null;
      this.loadInvoices();
      this.cdr.detectChanges();
    });
  }

  statusClass(status: string): string {
    if (status === 'Paid') return 'badge-paid';
    if (status === 'Unpaid') return 'badge-pending';
    return 'badge-cancelled';
  }

  sendWhatsapp(invoice: InvoiceListItem) {
    this.sendingWhatsappId = invoice.id;
    this.invoiceService.getFull(invoice.id).subscribe({
      next: (full: InvoiceRead) => {
        const message = this.buildWhatsappMessage(full);
        const mobile = full.customer_mobile.replace(/\D/g, '');
        const url = 'https://wa.me/91' + mobile + '?text=' + encodeURIComponent(message);
        window.open(url, '_blank');
        this.sendingWhatsappId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.sendingWhatsappId = null;
        this.cdr.detectChanges();
      },
    });
  }

  private buildWhatsappMessage(inv: InvoiceRead): string {
    let lines: string[] = [];

    lines.push('Hi ' + inv.customer_name + ',');
    lines.push('');
    lines.push('Here are your invoice #' + inv.id + ' details:');
    lines.push('');

    for (const item of inv.items) {
      lines.push(item.product_name + ' x ' + item.quantity + ' - ₹' + item.price_per_unit + ' each = ₹' + item.item_total);
    }

    lines.push('');
    lines.push('Discount: ₹' + inv.discount);
    lines.push('Grand Total: ₹' + inv.final_amount);
    lines.push('Amount Paid: ₹' + inv.amount_paid);
    lines.push('Balance Due: ₹' + inv.balance_due);
    lines.push('');
    lines.push('Thank you for shopping with us!');

    return lines.join('\n');
  }
}