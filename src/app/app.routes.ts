import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { MovimientoList } from './features/movimientos/movimiento-list/movimiento-list';
import { Objetivos } from './features/objetivos/objetivos';
import { Presupuesto } from './features/presupuesto/presupuesto';

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
    path: 'objetivos',
    component: Objetivos,
    title: 'Objetivos | ZeroBalance',
  },
  {
    path: 'presupuesto',
    component: Presupuesto,
    title: 'Presupuesto | ZeroBalance',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
