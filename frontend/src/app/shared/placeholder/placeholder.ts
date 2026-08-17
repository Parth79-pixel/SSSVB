import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="text-center text-white-50 py-5">
      <h3 class="text-white">{{ title }}</h3>
      <p>This page is coming up next in the build.</p>
    </div>
  `,
})
export class Placeholder{
  title = 'Page';

  constructor(route: ActivatedRoute) {
    this.title = route.snapshot.data['title'] ?? 'Page';
  }
}