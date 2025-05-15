import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EvaluationRequest } from '../dto/evaluation/evaluation-request';
import { EvaluationResponse } from '../dto/evaluation/evaluation-response';
import { ApiResponse } from '../dto/common/api-response';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private apiUrl = `${environment.apiUrl}/evaluations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<EvaluationResponse>> {
    return this.http.get<ApiResponse<EvaluationResponse>>(`${this.apiUrl}/${id}`);
  }

  getByEtudiant(etudiantId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/etudiant/${etudiantId}`);
  }

  getByModule(moduleId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/module/${moduleId}`);
  }

  getBySession(sessionId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/session/${sessionId}`);
  }

  getByType(type: string): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/type/${type}`);
  }

  getByEnseignant(enseignantId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/enseignant/${enseignantId}`);
  }

  getMoyenneByModuleAndSession(moduleId: number, sessionId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/module/${moduleId}/session/${sessionId}/moyenne`);
  }

  getMoyenneByEtudiantAndModule(etudiantId: number, moduleId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/etudiant/${etudiantId}/module/${moduleId}/moyenne`);
  }

  getEtudiantsByModuleAndSession(moduleId: number, sessionId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/module/${moduleId}/session/${sessionId}/etudiants`);
  }

  create(data: EvaluationRequest): Observable<ApiResponse<EvaluationResponse>> {
    return this.http.post<ApiResponse<EvaluationResponse>>(this.apiUrl, data);
  }

  update(id: number, data: EvaluationRequest): Observable<ApiResponse<EvaluationResponse>> {
    return this.http.put<ApiResponse<EvaluationResponse>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  valider(id: number, estValidee: boolean): Observable<ApiResponse<EvaluationResponse>> {
    return this.http.put<ApiResponse<EvaluationResponse>>(`${this.apiUrl}/${id}/valider`, { estValidee });
  }

  // Méthode pour récupérer les évaluations pour l'utilisateur connecté
  getMyEvaluations(): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/me`);
  }

  // Méthode pour récupérer les évaluations de l'utilisateur connecté par module
  getMyEvaluationsByModule(moduleId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/me/module/${moduleId}`);
  }

  // Méthode pour récupérer la moyenne de l'utilisateur connecté par module
  getMyMoyenneByModule(moduleId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/me/module/${moduleId}/moyenne`);
  }
}