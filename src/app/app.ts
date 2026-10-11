import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Navbar } from './shared/components/navbar/navbar';
import { ToastComponent } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
}
