// src/app/core/services/parent-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../dto/common/api-response';
import { ParentResponse } from '../dto/parent/parent-response';
import { EtudiantResponse } from '../dto/etudiant/etudiant-response';
import { AbsenceResponse } from '../dto/absence/absence-response';
import { EvaluationResponse } from '../dto/evaluation/evaluation-response';
import { ModuleResponse } from '../dto/module/module-response';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class ParentDashboardService {
  private apiUrl = environment.apiUrl;
  private selectedEnfantId: number | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Méthode utilitaire pour vérifier et retourner l'ID du parent
  private getParentId(): Observable<number> {
    const currentUser = this.authService.currentUserSubject.value;
    const parentId = currentUser?.id;

    if (!parentId) {
      return throwError(() => new Error("Impossible d'identifier le parent connecté"));
    }

    return of(parentId);
  }

  // Méthode avec gestion d'erreur améliorée
  private getResourceWithErrorHandling<T>(url: string, params?: any): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(url, { params }).pipe(
      catchError(error => {
        console.error(`Erreur lors de la requête vers ${url}:`, error);

        if (error.status === 401) {
          console.log('Erreur d\'authentification - redirection vers la page de connexion');
          this.authService.logout();
          return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
        }

        const message = error.error?.message || 'Erreur de connexion au serveur';
        return of({
          success: false,
          message: message,
          data: null as any,
          errors: error.error?.errors || []
        });
      })
    );
  }

  // Services pour la gestion des enfants
  getMesEnfants(): Observable<ApiResponse<EtudiantResponse[]>> {
    return this.getParentId().pipe(
      switchMap(parentId =>
        this.getResourceWithErrorHandling<ParentResponse>(`${this.apiUrl}/parents/${parentId}`)
      ),
      switchMap(response => {
        if (response.success && response.data) {
          // Le ParentResponse contient déjà la liste des enfants
          return of({
            success: true,
            message: 'Enfants récupérés avec succès',
            data: response.data.enfants,
            errors: []
          });
        } else {
          return of({
            success: false,
            message: response.message || 'Erreur lors de la récupération des enfants',
            data: [],
            errors: response.errors || []
          });
        }
      }),
      catchError(error => {
        console.error('getMesEnfants error:', error);
        return of({
          success: false,
          message: error.message,
          data: [],
          errors: []
        });
      })
    );
  }

  // Gestion de l'enfant sélectionné
  setSelectedEnfant(enfantId: number): void {
    this.selectedEnfantId = enfantId;
  }

  getSelectedEnfant(): number | null {
    return this.selectedEnfantId;
  }

  clearSelectedEnfant(): void {
    this.selectedEnfantId = null;
  }

  // Services pour les absences des enfants
  getAbsencesEnfant(enfantId: number): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.getResourceWithErrorHandling<AbsenceResponse[]>(`${this.apiUrl}/absences/etudiant/${enfantId}`);
  }

  getAbsencesEnfantParModule(enfantId: number, moduleId: number): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.getResourceWithErrorHandling<AbsenceResponse[]>(`${this.apiUrl}/absences/etudiant/${enfantId}/module/${moduleId}`);
  }

  getAbsencesEnfantParPeriode(enfantId: number, dateDebut: string, dateFin: string): Observable<ApiResponse<AbsenceResponse[]>> {
    const params = { dateDebut, dateFin };
    return this.getResourceWithErrorHandling<AbsenceResponse[]>(`${this.apiUrl}/absences/etudiant/${enfantId}/periode`, params);
  }

  // Service spécialisé pour les parents - toutes les absences de leurs enfants
  getToutesAbsencesMesEnfants(): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.getResourceWithErrorHandling<AbsenceResponse[]>(`${this.apiUrl}/absences/mes-enfants`);
  }

  // Services pour les évaluations (notes) des enfants
  getNotesEnfant(enfantId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.getResourceWithErrorHandling<EvaluationResponse[]>(`${this.apiUrl}/evaluations/etudiant/${enfantId}`);
  }

  getNotesEnfantParModule(enfantId: number, moduleId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.getResourceWithErrorHandling<EvaluationResponse[]>(`${this.apiUrl}/evaluations/etudiant/${enfantId}/module/${moduleId}`);
  }

  getMoyenneEnfantParModule(enfantId: number, moduleId: number): Observable<ApiResponse<number>> {
    return this.getResourceWithErrorHandling<number>(`${this.apiUrl}/evaluations/etudiant/${enfantId}/module/${moduleId}/moyenne`);
  }

  // Services pour les modules des enfants
  getModulesEnfant(enfantId: number): Observable<ApiResponse<ModuleResponse[]>> {
    return this.getResourceWithErrorHandling<EtudiantResponse>(`${this.apiUrl}/etudiants/${enfantId}`).pipe(
      switchMap(response => {
        if (response.success && response.data && response.data.classeId) {
          const classeId = response.data.classeId;
          return this.getResourceWithErrorHandling<ModuleResponse[]>(`${this.apiUrl}/modules/classe/${classeId}`);
        } else {
          return of({
            success: false,
            message: "Impossible de déterminer la classe de l'enfant",
            data: [],
            errors: []
          });
        }
      }),
      catchError(error => {
        console.error('getModulesEnfant error:', error);
        return of({
          success: false,
          message: error.message,
          data: [],
          errors: []
        });
      })
    );
  }

  // Méthode utilitaire pour la conversion de dates
  private convertDateToISOFormat(dateString: string): string {
    if (!dateString) return '';

    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const parts = dateString.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const parts = dateString.split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }

    console.error('Format de date non reconnu:', dateString);
    return dateString;
  }

  // Validation des droits d'accès (sécurité)
  verifierDroitAccesEnfant(enfantId: number): Observable<boolean> {
    return this.getMesEnfants().pipe(
      switchMap(response => {
        if (response.success) {
          const hasAccess = response.data.some(enfant => enfant.id === enfantId);
          return of(hasAccess);
        }
        return of(false);
      }),
      catchError(() => of(false))
    );
  }
}
