// src/app/core/services/etudiant-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../dto/common/api-response';
import { AbsenceResponse } from '../dto/absence/absence-response';
import { EvaluationResponse } from '../dto/evaluation/evaluation-response';
import { DocumentResponse } from '../dto/document/document-response';
import { ModuleResponse } from '../dto/module/module-response';

@Injectable({
  providedIn: 'root'
})
export class EtudiantDashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Services pour les absences
  getMesAbsences(): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.http.get<ApiResponse<AbsenceResponse[]>>(`${this.apiUrl}/absences/me`);
  }

  getMesAbsencesParModule(moduleId: number): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.http.get<ApiResponse<AbsenceResponse[]>>(`${this.apiUrl}/absences/me/module/${moduleId}`);
  }

  getMesAbsencesParPeriode(dateDebut: string, dateFin: string): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.http.get<ApiResponse<AbsenceResponse[]>>(`${this.apiUrl}/absences/me/periode`, {
      params: { dateDebut, dateFin }
    });
  }

  // Services pour les évaluations (notes)
  getMesNotes(): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/evaluations/me`);
  }

  getMesNotesParModule(moduleId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/evaluations/me/module/${moduleId}`);
  }

  getMaMoyenneParModule(moduleId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/evaluations/me/module/${moduleId}/moyenne`);
  }

  // Services pour les documents
  getMesDemandes(): Observable<ApiResponse<DocumentResponse[]>> {
    return this.http.get<ApiResponse<DocumentResponse[]>>(`${this.apiUrl}/documents/me`);
  }

  // Services pour les modules
  getMesModules(): Observable<ApiResponse<ModuleResponse[]>> {
    return this.http.get<ApiResponse<ModuleResponse[]>>(`${this.apiUrl}/modules/mes-modules`);
  }
}
