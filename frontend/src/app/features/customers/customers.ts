import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from './customer.service';
import { Customer, CustomerStats } from '../../core/models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  stats: CustomerStats = { total_customers: 0 };
  customers: Customer[] = [];
  loading = true;

  isSubmittingAdd = false;
  editingCustomer: Customer | null = null;
  deleteTarget: Customer | null = null;

  addForm!: FormGroup;
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
  ) {
    this.addForm = this.fb.group({
      customer_name: ['', Validators.required],
      mobile: ['', Validators.required],
      email: [''],
    });

    this.editForm = this.fb.group({
      customer_name: ['', Validators.required],
      mobile: ['', Validators.required],
      email: [''],
    });
  }

  ngOnInit() {
    this.loadStats();
    this.loadCustomers();
  }

  loadStats() {
    this.customerService.getStats().subscribe((s) => {
      this.stats = s;
      this.cdr.detectChanges();
    });
  }

  loadCustomers() {
    this.loading = true;
    this.customerService.list().subscribe((list) => {
      this.customers = list;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  onAddSubmit() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    this.isSubmittingAdd = true;
    const v = this.addForm.value;
    this.customerService
      .create({
        customer_name: v.customer_name!,
        mobile: v.mobile!,
        email: v.email || undefined,
      })
      .subscribe(() => {
        this.addForm.reset();
        this.isSubmittingAdd = false;
        this.loadStats();
        this.loadCustomers();
        this.cdr.detectChanges();
      });
  }

  openEdit(customer: Customer) {
    this.editingCustomer = customer;
    this.editForm.setValue({
      customer_name: customer.customer_name,
      mobile: customer.mobile,
      email: customer.email || '',
    });
    this.cdr.detectChanges();
  }

  closeEdit() {
    this.editingCustomer = null;
    this.cdr.detectChanges();
  }

  onEditSubmit() {
    if (!this.editingCustomer || this.editForm.invalid) return;

    const v = this.editForm.value;
    this.customerService
      .update(this.editingCustomer.id, {
        customer_name: v.customer_name!,
        mobile: v.mobile!,
        email: v.email || undefined,
      })
      .subscribe(() => {
        this.closeEdit();
        this.loadStats();
        this.loadCustomers();
        this.cdr.detectChanges();
      });
  }

  confirmDelete(customer: Customer) {
    this.deleteTarget = customer;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.deleteTarget = null;
    this.cdr.detectChanges();
  }

  onConfirmDelete() {
    if (!this.deleteTarget) return;

    this.customerService.delete(this.deleteTarget.id).subscribe(() => {
      this.deleteTarget = null;
      this.loadStats();
      this.loadCustomers();
      this.cdr.detectChanges();
    });
  }

  whatsappLink(mobile: string): string {
    return 'https://wa.me/91' + mobile;
  }
}