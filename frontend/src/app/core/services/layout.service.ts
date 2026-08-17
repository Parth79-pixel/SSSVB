import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
}