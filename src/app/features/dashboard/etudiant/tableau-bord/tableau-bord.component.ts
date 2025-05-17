// src/app/features/dashboard/etudiant/tableau-bord/tableau-bord.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EtudiantDashboardService } from '../../../../core/services/etudiant-dashboard.service';
import { AbsenceResponse } from '../../../../core/dto/absence/absence-response';
import { EvaluationResponse } from '../../../../core/dto/evaluation/evaluation-response';
import { DocumentResponse } from '../../../../core/dto/document/document-response';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-tableau-bord',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './tableau-bord.component.html',
  styleUrls: ['./tableau-bord.component.css']
})
export class TableauBordComponent implements OnInit {
  absencesRecentes: AbsenceResponse[] = [];
  notesRecentes: EvaluationResponse[] = [];
  demandesRecentes: DocumentResponse[] = [];

  isLoading = {
    absences: false,
    notes: false,
    demandes: false
  };

  error: {
    absences: string | null,
    notes: string | null,
    demandes: string | null
  } = {
    absences: null,
    notes: null,
    demandes: null
  };

  username: string = '';
  etudiantId: number | null = null;

  constructor(
    private etudiantService: EtudiantDashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadRecentAbsences();
    this.loadRecentNotes();
    this.loadRecentDemandes();
  }

  loadUserInfo(): void {
    const currentUser = this.authService.currentUserSubject.value;
    if (currentUser) {
      this.username = currentUser.sub || '';
      this.etudiantId = currentUser.id;
    }
  }

  loadRecentAbsences(): void {
    this.isLoading.absences = true;
    this.error.absences = null;

    this.etudiantService.getMesAbsences().subscribe({
      next: (response) => {
        if (response.success) {
          // Prendre les 5 absences les plus récentes
          this.absencesRecentes = response.data
            .sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
            .slice(0, 5);
        } else {
          this.error.absences = response.message || 'Erreur lors du chargement des absences';
        }
        this.isLoading.absences = false;
      },
      error: (err) => {
        this.error.absences = 'Erreur de connexion au serveur';
        this.isLoading.absences = false;
        console.error('Erreur lors du chargement des absences:', err);
      }
    });
  }

  loadRecentNotes(): void {
    this.isLoading.notes = true;
    this.error.notes = null;

    this.etudiantService.getMesNotes().subscribe({
      next: (response) => {
        if (response.success) {
          // Prendre les 5 notes les plus récentes
          this.notesRecentes = response.data
            .sort((a, b) => new Date(b.dateEvaluation).getTime() - new Date(a.dateEvaluation).getTime())
            .slice(0, 5);
        } else {
          this.error.notes = response.message || 'Erreur lors du chargement des notes';
        }
        this.isLoading.notes = false;
      },
      error: (err) => {
        this.error.notes = 'Erreur de connexion au serveur';
        this.isLoading.notes = false;
        console.error('Erreur lors du chargement des notes:', err);
      }
    });
  }

  loadRecentDemandes(): void {
    if (!this.etudiantId) {
      this.error.demandes = "Impossible d'identifier l'étudiant connecté";
      return;
    }

    this.isLoading.demandes = true;
    this.error.demandes = null;

    this.etudiantService.getMesDemandes().subscribe({
      next: (response) => {
        if (response.success) {
          // Prendre les 5 demandes les plus récentes
          this.demandesRecentes = response.data
            .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
            .slice(0, 5);
        } else {
          this.error.demandes = response.message || 'Erreur lors du chargement des demandes';
        }
        this.isLoading.demandes = false;
      },
      error: (err) => {
        this.error.demandes = 'Erreur de connexion au serveur';
        this.isLoading.demandes = false;
        console.error('Erreur lors du chargement des demandes:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
