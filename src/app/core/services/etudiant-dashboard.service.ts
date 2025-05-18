// src/app/core/services/etudiant-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../dto/common/api-response';
import { AbsenceResponse } from '../dto/absence/absence-response';
import { EvaluationResponse } from '../dto/evaluation/evaluation-response';
import { DocumentResponse } from '../dto/document/document-response';
import { ModuleResponse } from '../dto/module/module-response';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class EtudiantDashboardService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  private convertDateToISOFormat(dateString: string): string {
    if (!dateString) return '';

    // Si la date est déjà au format yyyy-MM-dd, la retourner directement
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    // Si la date est au format dd-MM-yyyy, la convertir
    if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const parts = dateString.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Si la date est au format dd/MM/yyyy, la convertir
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const parts = dateString.split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Si c'est un objet Date au format ISO, extraire la partie date
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }

    console.error('Format de date non reconnu:', dateString);
    return dateString;
  }
  // Méthode utilitaire pour vérifier et retourner l'ID de l'étudiant
  private getEtudiantId(): Observable<number> {
    const currentUser = this.authService.currentUserSubject.value;
    const etudiantId = currentUser?.id;

    if (!etudiantId) {
      return throwError(() => new Error("Impossible d'identifier l'étudiant connecté"));
    }

    return of(etudiantId);
  }

  // Méthode avec gestion d'erreur améliorée
  private getResourceWithErrorHandling<T>(url: string, params?: any): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(url, { params }).pipe(
      catchError(error => {
        console.error(`Erreur lors de la requête vers ${url}:`, error);

        // Gestion spécifique en fonction du code d'erreur
        if (error.status === 401) {
          console.log('Erreur d\'authentification - redirection vers la page de connexion');
          this.authService.logout();
          return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
        }

        // Autres erreurs HTTP
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

  // Services pour les absences
  getMesAbsences(): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.getEtudiantId().pipe(
      switchMap(etudiantId =>
        this.getResourceWithErrorHandling<AbsenceResponse[]>(`${this.apiUrl}/absences/etudiant/${etudiantId}`)
      ),
      catchError(error => {
        console.error('getMesAbsences error:', error);
        return of({
          success: false,
          message: error.message,
          data: [],
          errors: []
        });
      })
    );
  }

  getMesAbsencesParModule(moduleId: number): Observable<ApiResponse<AbsenceResponse[]>> {
    return this.getEtudiantId().pipe(
      switchMap(etudiantId =>
        this.getResourceWithErrorHandling<AbsenceResponse[]>(`${this.apiUrl}/absences/etudiant/${etudiantId}/module/${moduleId}`)
      ),
      catchError(error => {
        console.error('getMesAbsencesParModule error:', error);
        return of({
          success: false,
          message: error.message,
          data: [],
          errors: []
        });
      })
    );
  }

  getMesAbsencesParPeriode(dateDebut: string, dateFin: string): Observable<ApiResponse<AbsenceResponse[]>> {
    // Convertir les dates au format ISO avant l'envoi
    const dateDebutISO = this.convertDateToISOFormat(dateDebut);
    const dateFinISO = this.convertDateToISOFormat(dateFin);

    console.log('Dates converties:', {
      original: { dateDebut, dateFin },
      converted: { dateDebutISO, dateFinISO }
    });

    return this.getEtudiantId().pipe(
      switchMap(etudiantId =>
        this.getResourceWithErrorHandling<AbsenceResponse[]>(
          `${this.apiUrl}/absences/etudiant/${etudiantId}/periode`,
          { dateDebut: dateDebutISO, dateFin: dateFinISO }
        )
      ),
      catchError(error => {
        console.error('getMesAbsencesParPeriode error:', error);
        return of({
          success: false,
          message: error.message,
          data: [],
          errors: []
        });
      })
    );
  }
  // Services pour les évaluations (notes)
  getMesNotes(): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.getEtudiantId().pipe(
      switchMap(etudiantId =>
        this.getResourceWithErrorHandling<EvaluationResponse[]>(`${this.apiUrl}/evaluations/etudiant/${etudiantId}`)
      ),
      catchError(error => {
        console.error('getMesNotes error:', error);
        return of({
          success: false,
          message: error.message,
          data: [],
          errors: []
        });
      })
    );
  }

  getMesNotesParModule(moduleId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.getEtudiantId().pipe(
      switchMap(etudiantId =>
        this.getResourceWithErrorHandling<EvaluationResponse[]>(`${this.apiUrl}/evaluations/etudiant/${etudiantId}/module/${moduleId}`)
      ),
      catchError(error => {
        console.error('getMesNotesParModule error:', error);
        return of({
          success: false,
          message: error.message,
          data: [],
          errors: []
        });
      })
    );
  }

  getMaMoyenneParModule(moduleId: number): Observable<ApiResponse<number>> {
    return this.getEtudiantId().pipe(
      switchMap(etudiantId =>
        this.getResourceWithErrorHandling<number>(`${this.apiUrl}/evaluations/etudiant/${etudiantId}/module/${moduleId}/moyenne`)
      ),
      catchError(error => {
        console.error('getMaMoyenneParModule error:', error);
        return of({
          success: false,
          message: error.message,
          data: 0,
          errors: []
        });
      })
    );
  }

  // Services pour les documents
  getMesDemandes(): Observable<ApiResponse<DocumentResponse[]>> {
    return this.getEtudiantId().pipe(
      switchMap(etudiantId =>
        this.getResourceWithErrorHandling<DocumentResponse[]>(`${this.apiUrl}/documents/etudiant/${etudiantId}`)
      ),
      catchError(error => {
        console.error('getMesDemandes error:', error);
        return of({
          success: false,
          message: error.message,
          data: [],
          errors: []
        });
      })
    );
  }

  // Services pour les modules
  getMesModules(): Observable<ApiResponse<ModuleResponse[]>> {
    return this.getEtudiantId().pipe(
      switchMap(etudiantId =>
        // D'abord récupérer les informations de l'étudiant pour obtenir sa classe
        this.getResourceWithErrorHandling<any>(`${this.apiUrl}/etudiants/${etudiantId}`)
      ),
      switchMap(response => {
        if (response.success && response.data && response.data.classeId) {
          const classeId = response.data.classeId;
          console.log(`Classe de l'étudiant récupérée: ${classeId}`);
          // Maintenant récupérer les modules de cette classe
          return this.getResourceWithErrorHandling<ModuleResponse[]>(`${this.apiUrl}/modules/classe/${classeId}`);
        } else {
          console.error('Impossible de déterminer la classe de l\'étudiant:', response);
          return of({
            success: false,
            message: "Impossible de déterminer la classe de l'étudiant",
            data: [],
            errors: []
          });
        }
      }),
      catchError(error => {
        console.error('getMesModules error:', error);
        return of({
          success: false,
          message: error.message,
          data: [],
          errors: []
        });
      })
    );
  }

  // Version simplifiée pour tests - utilise l'endpoint global des modules
  getAllModules(): Observable<ApiResponse<ModuleResponse[]>> {
    return this.getResourceWithErrorHandling<ModuleResponse[]>(`${this.apiUrl}/modules`);
  }
}
