import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AbsenceRequest } from '../dto/absence/absence-request';
import { AbsenceResponse } from '../dto/absence/absence-response';
import { EtudiantResponse } from '../dto/etudiant/etudiant-response';
import { ApiResponse } from '../dto/common/api-response';
// First, modify the AbsenceService.getEtudiantsByModuleClasse method to add better error handling
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class AbsenceService {
  private apiUrl = `${environment.apiUrl}/absences`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.http.get<ApiResponse<AbsenceResponse[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<AbsenceResponse>> {
    return this.http.get<ApiResponse<AbsenceResponse>>(`${this.apiUrl}/${id}`);
  }

  getByEtudiant(etudiantId: number): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.http.get<ApiResponse<AbsenceResponse[]>>(`${this.apiUrl}/etudiant/${etudiantId}`);
  }

  getBySeance(seanceId: number): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.http.get<ApiResponse<AbsenceResponse[]>>(`${this.apiUrl}/seance/${seanceId}`);
  }

  getByEtudiantAndPeriode(etudiantId: number, start: string, end: string): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.http.get<ApiResponse<AbsenceResponse[]>>(`${this.apiUrl}/etudiant/${etudiantId}/periode`, {
      params: { dateDebut: start, dateFin: end }
    });
  }

  create(data: AbsenceRequest): Observable<ApiResponse<AbsenceResponse>> {
    return this.http.post<ApiResponse<AbsenceResponse>>(this.apiUrl, data);
  }

  update(id: number, data: AbsenceRequest): Observable<ApiResponse<AbsenceResponse>> {
    return this.http.put<ApiResponse<AbsenceResponse>>(`${this.apiUrl}/${id}`, data);
  }

  validate(id: number, validee: boolean): Observable<ApiResponse<AbsenceResponse>> {
    return this.http.put<ApiResponse<AbsenceResponse>>(`${this.apiUrl}/${id}/valider?validee=${validee}`, null);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Vérifiez cette méthode en particulier
  // src/app/core/services/absence.service.ts

  // core/services/absence.service.ts

// Méthode pour récupérer les étudiants par module et classe
  // Dans absence.service.ts

  getEtudiantsByModuleClasse(moduleId: number, classeId: number, enseignantId?: number) {
    let url = `${this.apiUrl}/module/${moduleId}/classe/${classeId}/etudiants`;
    if (enseignantId) {
      url += `?enseignantId=${enseignantId}`;
    }
    return this.http.get<ApiResponse<EtudiantResponse[]>>(url).pipe(
      catchError(error => {
        console.error('Error fetching students by module and class:', error);
        return of({
          success: false,
          message: 'Failed to fetch students: ' + (error.status === 401 ? 'Authorization error' : 'Server error'),
          data: [],
          errors: []
        });
      })
    );
  }

  createBulk(data: AbsenceRequest[], enseignantId?: number): Observable<ApiResponse<AbsenceResponse[]>> {
    console.log('Service received data:', data);

    let url = `${this.apiUrl}/bulk`;
    if (enseignantId) {
      url += `?enseignantId=${enseignantId}`;
    }

    // S'assurer que les données sont conformes avant envoi
    const validData = data.map(item => ({
      etudiantId: item.etudiantId,
      seanceId: item.seanceId,
      moduleId: item.moduleId, // S'assurer que moduleId est présent
      dateDebut: item.dateDebut,
      dateFin: item.dateFin,
      motif: item.motif || 'Absence non justifiée',
      commentaire: item.commentaire || ''
    }));

    console.log('Final request payload:', JSON.stringify(validData));

    return this.http.post<ApiResponse<AbsenceResponse[]>>(url, validData);
  }

}
