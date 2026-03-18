import { Routes } from '@angular/router';
import { Home } from './home';
import { RecentBills } from './recent-bills';
import { SizesSheet } from './sizes-sheet';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'sizes-sheet', component: SizesSheet },
  { path: 'recent-bills', component: RecentBills }
];
