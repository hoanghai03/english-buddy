import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageViewService } from './services/page-view.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    inject(PageViewService).init();
  }
}
