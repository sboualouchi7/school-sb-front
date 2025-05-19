import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SeanceRequest } from '../dto/seance/seance-request';
import { SeanceResponse } from '../dto/seance/seance-response';
import { ApiResponse } from '../dto/common/api-response';

@Injectable({ providedIn: 'root' })
export class SeanceService {
  private apiUrl = `${environment.apiUrl}/seances`;

  constructor(private http: HttpClient) {}

  getAllSeances(): Observable<ApiResponse<SeanceResponse[]>> {
    return this.http.get<ApiResponse<SeanceResponse[]>>(`${this.apiUrl}`);
  }

  getSeanceById(id: number): Observable<ApiResponse<SeanceResponse>> {
    return this.http.get<ApiResponse<SeanceResponse>>(`${this.apiUrl}/${id}`);
  }

  getSeancesByModule(moduleId: number): Observable<ApiResponse<SeanceResponse[]>> {
    return this.http.get<ApiResponse<SeanceResponse[]>>(`${this.apiUrl}/module/${moduleId}`);
  }

  getSeancesByEnseignant(enseignantId: number): Observable<ApiResponse<SeanceResponse[]>> {
    return this.http.get<ApiResponse<SeanceResponse[]>>(`${this.apiUrl}/enseignant/${enseignantId}`);
  }

  getSeancesByStatut(statut: string): Observable<ApiResponse<SeanceResponse[]>> {
    return this.http.get<ApiResponse<SeanceResponse[]>>(`${this.apiUrl}/statut/${statut}`);
  }

  getSeancesByDate(date: string): Observable<ApiResponse<SeanceResponse[]>> {
    return this.http.get<ApiResponse<SeanceResponse[]>>(`${this.apiUrl}/date/${date}`);
  }

  getSeancesByEnseignantAndPeriode(id: number, debut: string, fin: string): Observable<ApiResponse<SeanceResponse[]>> {
    return this.http.get<ApiResponse<SeanceResponse[]>>(`${this.apiUrl}/enseignant/${id}/periode?debut=${debut}&fin=${fin}`);
  }

  getSeancesByClasseAndDate(classeId: number, date: string): Observable<ApiResponse<SeanceResponse[]>> {
    return this.http.get<ApiResponse<SeanceResponse[]>>(`${this.apiUrl}/classe/${classeId}/date/${date}`);
  }

  createSeance(request: SeanceRequest): Observable<ApiResponse<SeanceResponse>> {
    return this.http.post<ApiResponse<SeanceResponse>>(`${this.apiUrl}`, request);
  }

  updateSeance(id: number, request: SeanceRequest): Observable<ApiResponse<SeanceResponse>> {
    return this.http.put<ApiResponse<SeanceResponse>>(`${this.apiUrl}/${id}`, request);
  }

  updateStatut(id: number, statut: string): Observable<ApiResponse<SeanceResponse>> {
    return this.http.patch<ApiResponse<SeanceResponse>>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  deleteSeance(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  activerSeance(id: number, actif: boolean): Observable<ApiResponse<SeanceResponse>> {
    return this.http.patch<ApiResponse<SeanceResponse>>(`${this.apiUrl}/${id}/actif`, { actif });
  }
  getSeancesByPeriode(dateDebut: string, dateFin: string): Observable<ApiResponse<SeanceResponse[]>> {
    return this.http.get<ApiResponse<SeanceResponse[]>>(`${this.apiUrl}/periode`, {
      params: { dateDebut, dateFin }
    });
  }

// Récupérer les séances par enseignant et module
  getSeancesByEnseignantAndModule(enseignantId: number, moduleId: number): Observable<ApiResponse<SeanceResponse[]>> {
    return this.http.get<ApiResponse<SeanceResponse[]>>(`${this.apiUrl}/enseignant/${enseignantId}/module/${moduleId}`);
  }

// Marquer une séance comme effectuée ou non
  markSeanceAsCompleted(seanceId: number, completed: boolean): Observable<ApiResponse<SeanceResponse>> {
    const statut = completed ? 'REALISEE' : 'PLANIFIEE';
    return this.updateStatut(seanceId, statut);
  }

// Dupliquer une séance (utile pour créer des séances récurrentes)
  duplicateSeance(seanceId: number, newDate: string): Observable<ApiResponse<SeanceResponse>> {
    return this.http.post<ApiResponse<SeanceResponse>>(`${this.apiUrl}/${seanceId}/duplicate`, {
      dateSeance: newDate
    });
  }

// Statistiques des séances pour un enseignant
  getSeanceStats(enseignantId: number, startDate?: string, endDate?: string): Observable<ApiResponse<any>> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats/enseignant/${enseignantId}`, { params });
  }
}
