import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { Observable } from 'rxjs';
import { EtudiantRequest } from '../dto/etudiant/etudiant-request';
import { EtudiantResponse } from '../dto/etudiant/etudiant-response';
import { ApiResponse } from '../dto/common/api-response';

@Injectable({
  providedIn: 'root'
})
export class EtudiantService {
  private apiUrl = `${environment.apiUrl}/etudiants`;

  constructor(private http: HttpClient) {}

  getAllEtudiants(): Observable<ApiResponse<EtudiantResponse[]>> {
    return this.http.get<ApiResponse<EtudiantResponse[]>>(`${this.apiUrl}`);
  }

  getEtudiantById(id: number): Observable<ApiResponse<EtudiantResponse>> {
    return this.http.get<ApiResponse<EtudiantResponse>>(`${this.apiUrl}/${id}`);
  }

  getEtudiantsByClasseId(classeId: number): Observable<ApiResponse<EtudiantResponse[]>> {
    return this.http.get<ApiResponse<EtudiantResponse[]>>(`${this.apiUrl}/classe/${classeId}`);
  }

  createEtudiant(request: EtudiantRequest): Observable<ApiResponse<EtudiantResponse>> {
    return this.http.post<ApiResponse<EtudiantResponse>>(`${this.apiUrl}`, request);
  }

  updateEtudiant(id: number, request: EtudiantRequest): Observable<ApiResponse<EtudiantResponse>> {
    return this.http.put<ApiResponse<EtudiantResponse>>(`${this.apiUrl}/${id}`, request);
  }

  deleteEtudiant(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  activate(id: number, actif: boolean): Observable<ApiResponse<EtudiantResponse>> {
    return this.http.patch<ApiResponse<EtudiantResponse>>(`${this.apiUrl}/${id}/activer`, { actif });
  }
}
