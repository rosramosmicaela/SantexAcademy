import { Routes } from '@angular/router';
import { authGuard } from './services/auth';
import { LoginComponent } from './pages/login.component';
import { PlayersListComponent } from './pages/players-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'players', component: PlayersListComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'players' },
  { path: '**', redirectTo: 'players' },
];