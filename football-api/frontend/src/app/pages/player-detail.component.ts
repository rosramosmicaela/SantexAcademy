import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Chart,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { Player, PlayersService } from '../services/players.service';

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-player-detail',
  imports: [RouterLink],
  template: `
    <p><a routerLink="/players">← Volver al listado</a></p>

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }

    @if (player(); as p) {
      <div class="card info-card">
        <h2>{{ p.name }}</h2>
        <p><strong>Club:</strong> {{ p.club }}</p>
        <p><strong>Posición:</strong> {{ p.position }}</p>
        <p><strong>Nacionalidad:</strong> {{ p.nationality }}</p>
        <p><strong>Rating:</strong> {{ p.rating }}</p>
        <p><strong>Versión FIFA:</strong> {{ p.fifaVersion }}</p>
        <p><a [routerLink]="['/players', p.id, 'edit']">Editar jugador</a></p>
      </div>
    }

    <div class="card chart-card" [hidden]="!player()">
      <h3>Skills</h3>
      <canvas #radar></canvas>
    </div>
  `,
  styles: [
    `
      .info-card {
        margin-bottom: 16px;
      }
      .chart-card {
        max-width: 520px;
      }
    `,
  ],
})
export class PlayerDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private playersService = inject(PlayersService);

  @ViewChild('radar', { static: true }) radar!: ElementRef<HTMLCanvasElement>;

  player = signal<Player | null>(null);
  error = signal('');
  private chart?: Chart;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.playersService.getPlayer(id).subscribe({
      next: (p) => {
        this.player.set(p);
        this.drawChart(p);
      },
      error: () => this.error.set('No se encontró el jugador.'),
    });
  }

  private drawChart(p: Player) {
    this.chart?.destroy();
    this.chart = new Chart(this.radar.nativeElement, {
      type: 'radar',
      data: {
        labels: ['Velocidad', 'Tiro', 'Pase', 'Regate', 'Defensa', 'Físico'],
        datasets: [
          {
            label: p.name,
            data: [
              p.speed,
              p.shooting,
              p.passing,
              p.dribbling,
              p.defending,
              p.physic,
            ],
            backgroundColor: 'rgba(11, 122, 83, 0.25)',
            borderColor: '#0b7a53',
            pointBackgroundColor: '#0b7a53',
          },
        ],
      },
      options: {
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } },
      },
    });
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}