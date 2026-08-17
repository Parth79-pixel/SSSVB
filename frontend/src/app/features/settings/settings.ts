import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  loading = true;
  notConfigured = false;
  successMessage = '';
  isSaving = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      shop_name: ['', Validators.required],
      address: [''],
      phone: [''],
      invoice_prefix: ['', Validators.required],
      tax_percent: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.settingsService.get().subscribe({
      next: (s) => {
        this.form.setValue({
          shop_name: s.shop_name,
          address: s.address || '',
          phone: s.phone || '',
          invoice_prefix: s.invoice_prefix,
          tax_percent: Number(s.tax_percent),
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) {
          this.notConfigured = true;
        }
        this.cdr.detectChanges();
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    const v = this.form.value;

    this.settingsService
      .update({
        shop_name: v.shop_name!,
        address: v.address || undefined,
        phone: v.phone || undefined,
        invoice_prefix: v.invoice_prefix!,
        tax_percent: v.tax_percent!,
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = 'Configuration saved successfully!';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 4000);
        },
        error: () => {
          this.isSaving = false;
          this.cdr.detectChanges();
        },
      });
  }
}