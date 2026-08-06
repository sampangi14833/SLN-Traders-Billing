import { Routes } from '@angular/router';
import { Home } from './home';
import { RecentBills } from './recent-bills';
import { SizesSheet } from './sizes-sheet';
import { Login } from './login';
import { Register } from './register';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'sizes-sheet', component: SizesSheet, canActivate: [authGuard] },
  { path: 'recent-bills', component: RecentBills, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
