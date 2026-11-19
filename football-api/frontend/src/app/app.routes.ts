import { Routes } from '@angular/router';
import { authGuard } from './services/auth';
import { LoginComponent } from './pages/login.component';
import { PlayersListComponent } from './pages/players-list.component';
import { PlayerDetailComponent } from './pages/player-detail.component';
import { PlayerFormComponent } from './pages/player-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'players', component: PlayersListComponent, canActivate: [authGuard] },
  // OJO: 'players/new' tiene que ir antes que 'players/:id'
  { path: 'players/new', component: PlayerFormComponent, canActivate: [authGuard] },
  { path: 'players/:id', component: PlayerDetailComponent, canActivate: [authGuard] },
  { path: 'players/:id/edit', component: PlayerFormComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'players' },
  { path: '**', redirectTo: 'players' },
];