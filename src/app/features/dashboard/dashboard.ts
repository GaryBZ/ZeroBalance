import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Movement {
  merchant: string;
  category: string;
  date: string;
  amount: string;
  icon: 'cart' | 'train' | 'coffee' | 'cloud';
  featured?: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly availableBalance = '$1,840.50';
  protected readonly monthlyExpenses = '$2,459.50';
  protected readonly budgetProgress = 68;

  protected readonly movements: Movement[] = [
    { merchant: 'Supermercado La Colmena', category: 'Alimentación', date: 'Hoy, 10:42', amount: '-$86.40', icon: 'cart', featured: true },
    { merchant: 'Metro y transporte', category: 'Transporte', date: 'Ayer, 08:15', amount: '-$32.00', icon: 'train' },
    { merchant: 'Café Central', category: 'Ocio', date: '12 oct, 16:30', amount: '-$8.50', icon: 'coffee', featured: true },
    { merchant: 'Suscripción Nube', category: 'Servicios', date: '10 oct, 09:00', amount: '-$12.99', icon: 'cloud' },
  ];
}
