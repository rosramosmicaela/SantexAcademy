import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Player {
  id: number;
  name: string;
  club: string;
  position: string;
  nationality: string;
  rating: number;
  speed: number;
  shooting: number;
  dribbling: number;
  passing: number;
  defending: number;
  physic: number;
  fifaVersion: string;
}

export interface PlayersPage {
  items: Player[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlayerFilters {
  name?: string;
  club?: string;
  position?: string;
  fifaVersion?: string;
}

export type PlayerPayload = Partial<Omit<Player, 'id' | 'fifaVersion'>>;

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/players';

  private buildParams(filters: PlayerFilters): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        params = params.set(key, value);
      }
    }
    return params;
  }

  getPlayers(
    filters: PlayerFilters,
    page: number,
    limit: number,
  ): Observable<PlayersPage> {
    const params = this.buildParams(filters)
      .set('page', page)
      .set('limit', limit);
    return this.http.get<PlayersPage>(this.baseUrl, { params });
  }

  getPlayer(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.baseUrl}/${id}`);
  }

  createPlayer(data: PlayerPayload): Observable<Player> {
    return this.http.post<Player>(this.baseUrl, data);
  }

  updatePlayer(id: number, data: PlayerPayload): Observable<Player> {
    return this.http.patch<Player>(`${this.baseUrl}/${id}`, data);
  }

  exportCsv(filters: PlayerFilters): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export`, {
      params: this.buildParams(filters),
      responseType: 'blob',
    });
  }
}