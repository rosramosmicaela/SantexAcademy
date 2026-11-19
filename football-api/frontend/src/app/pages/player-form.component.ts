import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlayerPayload, PlayersService } from '../services/players.service';

@Component({
  selector: 'app-player-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <p><a routerLink="/players">← Volver al listado</a></p>
    <h2>{{ editingId ? 'Editar jugador' : 'Crear jugador' }}</h2>

    <form class="card form" [formGroup]="form" (ngSubmit)="submit()">
      <label>
        Nombre
        <input formControlName="name" maxlength="255" />
      </label>
      @if (invalid('name')) {
        <span class="error">El nombre es obligatorio.</span>
      }

      <label>
        Posición
        <input formControlName="position" list="positions" placeholder="Ej: ST" />
      </label>
      <datalist id="positions">
        @for (pos of positions; track pos) {
          <option [value]="pos"></option>
        }
      </datalist>
      @if (invalid('position')) {
        <span class="error">La posición es obligatoria.</span>
      }

      <label>
        Club
        <input formControlName="club" />
      </label>

      <label>
        Nacionalidad
        <input formControlName="nationality" />
      </label>

      <label>
        Calificación (1 a 99)
        <input type="number" formControlName="rating" min="1" max="99" />
      </label>
      @if (invalid('rating')) {
        <span class="error">Ingresá un número entero entre 1 y 99.</span>
      }

      <h3>Skills (0 a 99)</h3>
      <div class="skills">
        @for (s of skills; track s.key) {
          <label>
            {{ s.label }}
            <input type="number" [formControlName]="s.key" min="0" max="99" />
          </label>
          @if (invalid(s.key)) {
            <span class="error">{{ s.label }}: entero entre 0 y 99.</span>
          }
        }
      </div>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <div class="actions">
        <button type="submit" [disabled]="saving()">
          {{ saving() ? 'Guardando...' : 'Guardar' }}
        </button>
        <button type="button" class="secondary" (click)="cancel()">Cancelar</button>
      </div>
    </form>
  `,
  styles: [
    `
      .form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 520px;
      }
      .skills {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class PlayerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playersService = inject(PlayersService);

  editingId: number | null = null;
  saving = signal(false);
  error = signal('');

  positions = [
    'ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM',
    'LM', 'RM', 'LB', 'RB', 'CB', 'GK',
  ];

  skills = [
    { key: 'speed', label: 'Velocidad' },
    { key: 'shooting', label: 'Tiro' },
    { key: 'passing', label: 'Pase' },
    { key: 'dribbling', label: 'Regate' },
    { key: 'defending', label: 'Defensa' },
    { key: 'physic', label: 'Físico' },
  ];

  private skillValidators = [
    Validators.min(0),
    Validators.max(99),
    Validators.pattern(/^\d+$/),
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    position: ['', [Validators.required]],
    club: [''],
    nationality: [''],
    rating: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(99),
        Validators.pattern(/^\d+$/),
      ],
    ],
    speed: [null as number | null, this.skillValidators],
    shooting: [null as number | null, this.skillValidators],
    passing: [null as number | null, this.skillValidators],
    dribbling: [null as number | null, this.skillValidators],
    defending: [null as number | null, this.skillValidators],
    physic: [null as number | null, this.skillValidators],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId = Number(id);
      this.playersService.getPlayer(this.editingId).subscribe({
        next: (p) =>
          this.form.patchValue({
            name: p.name,
            position: p.position,
            club: p.club === 'Unknown Club' ? '' : p.club,
            nationality:
              p.nationality === 'Unknown Nationality' ? '' : p.nationality,
            rating: p.rating,
            speed: p.speed,
            shooting: p.shooting,
            passing: p.passing,
            dribbling: p.dribbling,
            defending: p.defending,
            physic: p.physic,
          }),
        error: () => this.error.set('No se encontró el jugador.'),
      });
    }
  }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Saco los campos vacíos para no mandarle basura al backend
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.form.getRawValue())) {
      if (value !== null && value !== '') {
        payload[key] = typeof value === 'string' ? value.trim() : value;
      }
    }

    this.saving.set(true);
    this.error.set('');

    const request = this.editingId
      ? this.playersService.updatePlayer(
          this.editingId,
          payload as PlayerPayload,
        )
      : this.playersService.createPlayer(payload as PlayerPayload);

    request.subscribe({
      next: (player) => this.router.navigate(['/players', player.id]),
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message;
        this.error.set(
          Array.isArray(msg) ? msg.join(' | ') : msg || 'No se pudo guardar.',
        );
      },
    });
  }

  cancel() {
    this.router.navigate(['/players']);
  }
}