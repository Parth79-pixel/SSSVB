import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageInvoices } from './manage-invoices';

describe('ManageInvoices', () => {
  let component: ManageInvoices;
  let fixture: ComponentFixture<ManageInvoices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageInvoices],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageInvoices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
