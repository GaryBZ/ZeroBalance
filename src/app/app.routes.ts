import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { MovimientoList } from './features/movimientos/movimiento-list/movimiento-list';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard | ZeroBalance',
  },
  {
    path: 'movimientos',
    component: MovimientoList,
    title: 'Movimientos | ZeroBalance',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
