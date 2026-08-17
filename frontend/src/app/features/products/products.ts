import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ProductService, CategoryService } from './product.service';
import { Product, Category } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  imageBaseUrl = environment.apiUrl + '/static/products';

  stats = { total_products: 0, total_stock: 0, low_stock: 0 };
  products: Product[] = [];
  categories: Category[] = [];

  loading = true;

  selectedImage: File | null = null;
  imageFileName = 'No file chosen';
  isSubmittingAdd = false;

  editingProduct: Product | null = null;
  deleteTargetId: number | null = null;

  addForm!: ReturnType<FormBuilder['group']>;
  editForm!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
  ) {
    this.addForm = this.fb.group({
      product_name: ['', Validators.required],
      category: ['', Validators.required],
      price: [null as number | null, [Validators.required, Validators.min(0)]],
      stock: [null as number | null, [Validators.required, Validators.min(0)]],
      status: ['active', Validators.required],
    });

    this.editForm = this.fb.group({
      product_name: ['', Validators.required],
      price: [null as number | null, [Validators.required, Validators.min(0)]],
      stock: [null as number | null, [Validators.required, Validators.min(0)]],
      status: ['active', Validators.required],
    });
  }

  ngOnInit() {
    this.loadStats();
    this.loadCategories();
    this.loadProducts();
  }

  loadStats() {
    this.productService.getStats().subscribe((s) => {
      this.stats = s;
      this.cdr.detectChanges();
    });
  }

  loadCategories() {
    this.categoryService.list().subscribe((c) => {
      this.categories = c;
      this.cdr.detectChanges();
    });
  }

  loadProducts() {
    this.loading = true;
    this.productService.list(1, 1000).subscribe((res) => {
      this.products = res.items.sort((a, b) => a.id - b.id);
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedImage = input.files && input.files.length > 0 ? input.files[0] : null;
    this.imageFileName = this.selectedImage ? this.selectedImage.name : 'No file chosen';
  }

  onAddSubmit() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.isSubmittingAdd = true;
    const v = this.addForm.value;
    const formData = new FormData();
    formData.append('product_name', v.product_name!);
    formData.append('category', v.category!);
    formData.append('price', String(v.price));
    formData.append('stock', String(v.stock));
    formData.append('status', v.status!);
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.productService.create(formData).subscribe(() => {
      this.addForm.reset({ status: 'active' });
      this.selectedImage = null;
      this.imageFileName = 'No file chosen';
      this.isSubmittingAdd = false;
      this.loadStats();
      this.loadProducts();
      this.cdr.detectChanges();
    });
  }

  openEdit(product: Product) {
    this.editingProduct = product;
    this.editForm.setValue({
      product_name: product.product_name,
      price: product.price,
      stock: product.stock,
      status: product.status,
    });
    this.cdr.detectChanges();
  }

  closeEdit() {
    this.editingProduct = null;
    this.cdr.detectChanges();
  }

  onEditSubmit() {
    if (!this.editingProduct || this.editForm.invalid) return;

    const v = this.editForm.value;
    this.productService
      .update(this.editingProduct.id, {
        product_name: v.product_name!,
        price: v.price!,
        stock: v.stock!,
        status: v.status!,
      })
      .subscribe(() => {
        this.closeEdit();
        this.loadStats();
        this.loadProducts();
        this.cdr.detectChanges();
      });
  }

  confirmDelete(id: number) {
    this.deleteTargetId = id;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.deleteTargetId = null;
    this.cdr.detectChanges();
  }

  onConfirmDelete() {
    if (!this.deleteTargetId) return;

    this.productService.delete(this.deleteTargetId).subscribe(() => {
      this.deleteTargetId = null;
      this.loadStats();
      this.loadProducts();
      this.cdr.detectChanges();
    });
  }
}