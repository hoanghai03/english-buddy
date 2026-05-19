import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageViewService } from './services/page-view.service';
import { ContactFloatComponent } from './shared/contact-float';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContactFloatComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    inject(PageViewService).init();
  }
}
