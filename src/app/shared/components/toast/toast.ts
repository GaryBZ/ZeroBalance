import { Component, inject } from '@angular/core';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {
  protected readonly toast = inject(Toast);
}
