import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class Toast {
  private nextId = 0;
  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  readonly message = signal<ToastMessage | null>(null);

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  dismiss(): void {
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    this.message.set(null);
  }

  private show(message: string, type: ToastType): void {
    if (!message.trim()) {
      return;
    }

    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
    }

    this.message.set({
      id: ++this.nextId,
      message,
      type,
    });
    this.timeoutId = setTimeout(() => this.dismiss(), 4000);
  }
}
