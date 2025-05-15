import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../../environments/environment";
import { SessionRequest } from '../dto/session/session-request';
import { SessionResponse } from '../dto/session/session-response';
import { ApiResponse } from '../dto/common/api-response';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<SessionResponse[]>> {
    return this.http.get<ApiResponse<SessionResponse[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<SessionResponse>> {
    return this.http.get<ApiResponse<SessionResponse>>(`${this.apiUrl}/${id}`);
  }

  getByResponsable(responsableId: number): Observable<ApiResponse<SessionResponse[]>> {
    return this.http.get<ApiResponse<SessionResponse[]>>(`${this.apiUrl}/responsable/${responsableId}`);
  }

  getByAnneeScolaire(anneeScolaire: string): Observable<ApiResponse<SessionResponse[]>> {
    return this.http.get<ApiResponse<SessionResponse[]>>(`${this.apiUrl}/annee/${anneeScolaire}`);
  }

  getByStatut(statut: string): Observable<ApiResponse<SessionResponse[]>> {
    return this.http.get<ApiResponse<SessionResponse[]>>(`${this.apiUrl}/statut/${statut}`);
  }

  create(request: SessionRequest): Observable<ApiResponse<SessionResponse>> {
    return this.http.post<ApiResponse<SessionResponse>>(this.apiUrl, request);
  }

  update(id: number, request: SessionRequest): Observable<ApiResponse<SessionResponse>> {
    return this.http.put<ApiResponse<SessionResponse>>(`${this.apiUrl}/${id}`, request);
  }

  updateStatut(id: number, statut: string): Observable<ApiResponse<SessionResponse>> {
    return this.http.patch<ApiResponse<SessionResponse>>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  activer(id: number, actif: boolean): Observable<ApiResponse<SessionResponse>> {
    return this.http.patch<ApiResponse<SessionResponse>>(`${this.apiUrl}/${id}/activer`, { actif });
  }
}
