// core/services/evaluation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EvaluationRequest } from '../dto/evaluation/evaluation-request';
import { EvaluationResponse } from '../dto/evaluation/evaluation-response';
import { ApiResponse } from '../dto/common/api-response';
import { EtudiantResponse } from '../dto/etudiant/etudiant-response';
import { EtudiantAvecNotes, ColonneEvaluation } from '../models/evaluation-tableau-interface.interface';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private apiUrl = `${environment.apiUrl}/evaluations`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les évaluations
   */
  getAll(): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(this.apiUrl);
  }

  /**
   * Récupère une évaluation par son ID
   * @param id ID de l'évaluation
   */
  getById(id: number): Observable<ApiResponse<EvaluationResponse>> {
    return this.http.get<ApiResponse<EvaluationResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère les évaluations par module
   * @param moduleId ID du module
   */
  getByModule(moduleId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/module/${moduleId}`);
  }

  /**
   * Récupère les évaluations par étudiant
   * @param etudiantId ID de l'étudiant
   */
  getByEtudiant(etudiantId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/etudiant/${etudiantId}`);
  }

  /**
   * Crée une nouvelle évaluation
   * @param data Données de l'évaluation
   */
  create(data: EvaluationRequest): Observable<ApiResponse<EvaluationResponse>> {
    return this.http.post<ApiResponse<EvaluationResponse>>(this.apiUrl, data);
  }

  /**
   * Met à jour une évaluation existante
   * @param id ID de l'évaluation
   * @param data Nouvelles données
   */
  update(id: number, data: EvaluationRequest): Observable<ApiResponse<EvaluationResponse>> {
    return this.http.put<ApiResponse<EvaluationResponse>>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime une évaluation
   * @param id ID de l'évaluation
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Construit le tableau des notes pour une classe et un module donné
   * @param moduleId ID du module
   * @param classeId ID de la classe
   * @param enseignantId ID de l'enseignant
   * @param sessionId ID de la session (optionnel)
   */
  construireTableauNotes(
    moduleId: number,
    classeId: number,
    enseignantId: number,
    sessionId?: number
  ): Observable<{
    etudiants: EtudiantAvecNotes[],
    colonnes: ColonneEvaluation[]
  }> {
    // 1. Récupérer les étudiants de la classe
    const etudiantsObs = this.http.get<ApiResponse<EtudiantResponse[]>>(
      `${environment.apiUrl}/etudiants/classe/${classeId}`
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des étudiants:', error);
        return of({
          success: false,
          message: 'Erreur lors de la récupération des étudiants',
          data: [],
          errors: []
        });
      })
    );

    // 2. Récupérer les évaluations du module
    const evaluationsObs = this.getByModule(moduleId).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des évaluations:', error);
        return of({
          success: false,
          message: 'Erreur lors de la récupération des évaluations',
          data: [],
          errors: []
        });
      })
    );

    // 3. Combiner les résultats
    return forkJoin({
      etudiants: etudiantsObs,
      evaluations: evaluationsObs
    }).pipe(
      map(result => {
        const etudiants = result.etudiants.success ? result.etudiants.data : [];
        const evaluations = result.evaluations.success ? result.evaluations.data : [];

        // Créer les colonnes d'évaluation
        const colonnesMap = new Map<string, ColonneEvaluation>();
        evaluations.forEach(evaluation => {
          // Regrouper les évaluations par type
          const colId = `${evaluation.type}-${evaluation.sessionId || 'default'}`;
          if (!colonnesMap.has(colId)) {
            colonnesMap.set(colId, {
              id: colId,
              titre: this.formatTitreEvaluation(evaluation.type),
              type: evaluation.type,
              date: evaluation.dateEvaluation,
              coefficient: 1 // À ajuster selon vos besoins
            });
          }
        });
        const colonnes = Array.from(colonnesMap.values());

        // Structurer les données des étudiants avec leurs notes
        const etudiantsAvecNotes: EtudiantAvecNotes[] = etudiants.map(etudiant => {
          const notes: Record<string, any> = {};

          // Initialiser toutes les colonnes avec des notes vides
          colonnes.forEach(colonne => {
            notes[colonne.id] = {
              etudiantId: etudiant.id,
              note: null,
              estModifiee: false,
              estNouvelle: true
            };
          });

          // Remplir avec les notes existantes
          evaluations
            .filter(e => e.etudiantId === etudiant.id)
            .forEach(evaluation => {
              const colId = `${evaluation.type}-${evaluation.sessionId || 'default'}`;
              if (notes[colId]) {
                notes[colId] = {
                  id: evaluation.id,
                  etudiantId: etudiant.id,
                  note: evaluation.note,
                  estModifiee: false,
                  estNouvelle: false
                };
              }
            });

          return {
            id: etudiant.id,
            nom: etudiant.nom,
            prenom: etudiant.prenom,
            numeroEtudiant: etudiant.numeroEtudiant,
            notes: notes
          };
        });

        return {
          etudiants: etudiantsAvecNotes,
          colonnes: colonnes
        };
      })
    );
  }

  /**
   * Formate le titre d'une évaluation à partir de son type
   * @param type Type d'évaluation
   */
  private formatTitreEvaluation(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
  // Ajoutez ces méthodes à votre service EvaluationService existant

  /**
   * Valide une évaluation (marquage administratif)
   * @param id ID de l'évaluation
   * @param validation État de validation (true/false)
   */
  valider(id: number, validation: boolean): Observable<ApiResponse<EvaluationResponse>> {
    return this.http.patch<ApiResponse<EvaluationResponse>>(`${this.apiUrl}/${id}/validation`, { estValidee: validation });
  }

  /**
   * Supprime plusieurs évaluations en une seule opération
   * @param ids Liste des IDs d'évaluations à supprimer
   */
  deleteBulk(ids: number[]): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/delete-bulk`, { ids });
  }
  // Ajoutez ces méthodes à votre service EvaluationService existant (core/services/evaluation.service.ts)

  /**
   * Récupère les évaluations par classe
   * @param classeId ID de la classe
   */
  getByClasse(classeId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/classe/${classeId}`);
  }

  /**
   * Récupère les évaluations par module et session
   * @param moduleId ID du module
   * @param sessionId ID de la session
   */
  getByModuleAndSession(moduleId: number, sessionId: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.get<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/module/${moduleId}/session/${sessionId}`);
  }

  /**
   * Récupère les évaluations par étudiant, module et session
   * @param etudiantId ID de l'étudiant
   * @param moduleId ID du module
   * @param sessionId ID de la session
   */
  getByEtudiantAndModule(etudiantId: number, moduleId: number, sessionId?: number): Observable<ApiResponse<EvaluationResponse[]>> {
    let url = `${this.apiUrl}/etudiant/${etudiantId}/module/${moduleId}`;
    if (sessionId) {
      url += `/session/${sessionId}`;
    }
    return this.http.get<ApiResponse<EvaluationResponse[]>>(url);
  }

  /**
   * Création en masse d'évaluations
   * @param evaluations Liste des évaluations à créer
   */
  createBulk(evaluations: EvaluationRequest[]): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.http.post<ApiResponse<EvaluationResponse[]>>(`${this.apiUrl}/bulk`, evaluations);
  }
}
