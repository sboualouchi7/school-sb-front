// features/dashboard/enseignant/dashboard/widget-notes-recentes/widget-notes-recentes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EvaluationService } from '../../../../../core/services/evaluation.service';
import { AuthService } from '../../../../../core/services/auth-service';
import { EvaluationResponse } from '../../../../../core/dto/evaluation/evaluation-response';

@Component({
  selector: 'app-widget-notes-recentes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './widget-notes-recentes.component.html',
  styleUrls: ['./widget-notes-recentes.component.css']
})
export class WidgetNotesRecentesComponent implements OnInit {
  notesRecentes: EvaluationResponse[] = [];
  isLoading = false;
  error: string | null = null;
  enseignantId: number | null = null;

  constructor(
    private evaluationService: EvaluationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCurrentEnseignantId();
    this.chargerNotesRecentes();
  }

  getCurrentEnseignantId(): void {
    const currentUser = this.authService.currentUserSubject.value;
    if (currentUser && currentUser.id) {
      this.enseignantId = currentUser.id;
    }
  }

  chargerNotesRecentes(): void {
    if (!this.enseignantId) {
      this.error = "Impossible d'identifier l'enseignant connecté";
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.evaluationService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          // Filtrer par enseignant et trier par date (les plus récentes d'abord)
          this.notesRecentes = response.data
            .filter(evals => evals.enseignantId === this.enseignantId)
            .sort((a, b) => {
              const dateA = new Date(this.formatDateForComparison(a.dateEvaluation));
              const dateB = new Date(this.formatDateForComparison(b.dateEvaluation));
              return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 5); // Prendre seulement les 5 plus récentes
        } else {
          this.error = response.message || "Erreur lors du chargement des notes récentes";
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des notes récentes";
        this.isLoading = false;
        console.error("Erreur lors du chargement des notes récentes:", err);
      }
    });
  }

  private formatDateForComparison(dateString: string): string {
    if (!dateString) return '';

    const parts = dateString.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 2) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return dateString;
  }
}
