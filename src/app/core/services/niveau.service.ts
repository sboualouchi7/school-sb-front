import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NiveauRequest } from '../dto/niveau/niveau-request';
import { NiveauResponse } from '../dto/niveau/niveau-response';
import { ApiResponse } from '../dto/common/api-response';

@Injectable({ providedIn: 'root' })
export class NiveauService {
  private apiUrl = `${environment.apiUrl}/niveaux`;

  constructor(private http: HttpClient) {}

  getAllNiveaux(): Observable<ApiResponse<NiveauResponse[]>> {
    return this.http.get<ApiResponse<NiveauResponse[]>>(this.apiUrl);
  }

  getNiveauById(id: number): Observable<ApiResponse<NiveauResponse>> {
    return this.http.get<ApiResponse<NiveauResponse>>(`${this.apiUrl}/${id}`);
  }

  getNiveauxActifs(): Observable<ApiResponse<NiveauResponse[]>> {
    return this.http.get<ApiResponse<NiveauResponse[]>>(`${this.apiUrl}/actifs`);
  }

  getNiveauxOrdonnes(): Observable<ApiResponse<NiveauResponse[]>> {
    return this.http.get<ApiResponse<NiveauResponse[]>>(`${this.apiUrl}/ordonnes`);
  }

  createNiveau(request: NiveauRequest): Observable<ApiResponse<NiveauResponse>> {
    return this.http.post<ApiResponse<NiveauResponse>>(this.apiUrl, request);
  }

  updateNiveau(id: number, request: NiveauRequest): Observable<ApiResponse<NiveauResponse>> {
    return this.http.put<ApiResponse<NiveauResponse>>(`${this.apiUrl}/${id}`, request);
  }

  deleteNiveau(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  activerNiveau(id: number, actif: boolean): Observable<ApiResponse<NiveauResponse>> {
    return this.http.patch<ApiResponse<NiveauResponse>>(`${this.apiUrl}/${id}/activer`, { actif });
  }
}
