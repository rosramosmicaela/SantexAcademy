import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Player,
  PlayerFilters,
  PlayersService,
} from '../services/players.service';

@Component({
  selector: 'app-players-list',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h2>Jugadores</h2>

    <form class="card filters" [formGroup]="filterForm" (ngSubmit)="search()">
      <label>
        Nombre
        <input formControlName="name" placeholder="Ej: Messi" />
      </label>
      <label>
        Club
        <input formControlName="club" placeholder="Ej: Barcelona" />
      </label>
      <label>
        Posición
        <select formControlName="position">
          <option value="">Todas</option>
          @for (pos of positions; track pos) {
            <option [value]="pos">{{ pos }}</option>
          }
        </select>
      </label>
      <label>
        Versión FIFA
        <select formControlName="fifaVersion">
          <option value="">Todas</option>
          @for (v of versions; track v) {
            <option [value]="v">FIFA {{ v }}</option>
          }
        </select>
      </label>
      <div class="actions">
        <button type="submit">Buscar</button>
        <button type="button" class="secondary" (click)="clear()">Limpiar</button>
        <button type="button" [disabled]="downloading()" (click)="download()">
          {{ downloading() ? 'Descargando...' : 'Descargar CSV' }}
        </button>
      </div>
    </form>

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }
    @if (loading()) {
      <p>Cargando...</p>
    }

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Club</th>
            <th>Posición</th>
            <th>Nacionalidad</th>
            <th>Rating</th>
            <th>FIFA</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (p of players(); track p.id) {
            <tr>
              <td>{{ p.name }}</td>
              <td>{{ p.club }}</td>
              <td>{{ p.position }}</td>
              <td>{{ p.nationality }}</td>
              <td>{{ p.rating }}</td>
              <td>{{ p.fifaVersion }}</td>
              <td>
                <a [routerLink]="['/players', p.id]">Ver</a> |
                <a [routerLink]="['/players', p.id, 'edit']">Editar</a>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="7">No se encontraron jugadores.</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="pager">
        <button
          type="button"
          class="secondary"
          [disabled]="page() <= 1 || loading()"
          (click)="goTo(page() - 1)"
        >
          Anterior
        </button>
        <span>Página {{ page() }} de {{ totalPages() }} ({{ total() }} jugadores)</span>
        <button
          type="button"
          class="secondary"
          [disabled]="page() >= totalPages() || loading()"
          (click)="goTo(page() + 1)"
        >
          Siguiente
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: flex-end;
        margin-bottom: 16px;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .pager {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
      }
    `,
  ],
})
export class PlayersListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private playersService = inject(PlayersService);

  positions = [
    'ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM',
    'LM', 'RM', 'LB', 'RB', 'CB', 'GK',
  ];
  versions = ['15', '16', '17', '18', '19', '20', '21', '22', '23'];

  filterForm = this.fb.nonNullable.group({
    name: [''],
    club: [''],
    position: [''],
    fifaVersion: [''],
  });

  players = signal<Player[]>([]);
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);
  loading = signal(false);
  downloading = signal(false);
  error = signal('');

  private limit = 20;

  ngOnInit() {
    this.load();
  }

  private currentFilters(): PlayerFilters {
    const v = this.filterForm.getRawValue();
    return {
      name: v.name.trim() || undefined,
      club: v.club.trim() || undefined,
      position: v.position || undefined,
      fifaVersion: v.fifaVersion || undefined,
    };
  }

  search() {
    this.page.set(1);
    this.load();
  }

  clear() {
    this.filterForm.reset();
    this.search();
  }

  goTo(p: number) {
    this.page.set(p);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.playersService
      .getPlayers(this.currentFilters(), this.page(), this.limit)
      .subscribe({
        next: (res) => {
          this.players.set(res.items);
          this.total.set(res.total);
          this.totalPages.set(Math.max(res.totalPages, 1));
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('No se pudo cargar el listado.');
        },
      });
  }

  download() {
    this.downloading.set(true);
    this.error.set('');
    this.playersService.exportCsv(this.currentFilters()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'players.csv';
        a.click();
        URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
        this.error.set('No se pudo descargar el CSV.');
      },
    });
  }
}