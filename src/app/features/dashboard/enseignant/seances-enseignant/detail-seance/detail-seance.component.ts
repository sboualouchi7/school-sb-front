// src/app/features/dashboard/enseignant/seances-enseignant/detail-seance/detail-seance.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeanceService } from '../../../../../core/services/seance.service';
import { SeanceResponse } from '../../../../../core/dto/seance/seance-response';
import { StatusSeance } from '../../../../../core/enums/StatusSeance';

@Component({
  selector: 'app-detail-seance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-seance.component.html',
  styleUrls: ['./detail-seance.component.css']
})
export class DetailSeanceComponent implements OnInit {
  @Input() seance: SeanceResponse | null = null;

  seanceDetails: SeanceResponse | null = null;
  isLoading = false;
  error: string | null = null;

  // Exposition de StatusSeance pour le template
  StatusSeance = StatusSeance;

  constructor(private seanceService: SeanceService) {}

  ngOnInit(): void {
    if (this.seance) {
      this.chargerDetailsSeance();
    }
  }

  chargerDetailsSeance(): void {
    if (!this.seance) return;

    this.isLoading = true;
    this.error = null;

    this.seanceService.getDetailSeance(this.seance.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.seanceDetails = response.data;
        } else {
          this.error = response.message || 'Erreur lors du chargement des détails';
          this.seanceDetails = this.seance; // Fallback aux données existantes
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur de connexion au serveur';
        this.seanceDetails = this.seance; // Fallback aux données existantes
        this.isLoading = false;
        console.error('Erreur lors du chargement des détails de la séance:', err);
      }
    });
  }

  changerStatut(nouveauStatut: string): void {
    if (!this.seanceDetails) return;

    this.seanceService.updateStatut(this.seanceDetails.id, nouveauStatut).subscribe({
      next: (response) => {
        if (response.success && this.seanceDetails) {
          this.seanceDetails.statut = nouveauStatut;

          // Mettre à jour également la séance d'origine si c'est la même
          if (this.seance && this.seance.id === this.seanceDetails.id) {
            this.seance.statut = nouveauStatut;
          }
        } else {
          this.error = response.message || 'Erreur lors de la mise à jour du statut';
        }
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour du statut';
        console.error('Erreur lors de la mise à jour du statut:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      // Gérer différents formats de date
      let date: Date;

      if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
        // Format dd-MM-yyyy
        const parts = dateString.split('-');
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        date = new Date(dateString);
      }

      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  }

  formatStatut(statut: string): string {
    switch (statut) {
      case StatusSeance.PLANIFIEE:
        return 'Planifiée';
      case StatusSeance.APPROUVEE:
        return 'Approuvée';
      case StatusSeance.REALISEE:
        return 'Réalisée';
      case StatusSeance.ANNULEE:
        return 'Annulée';
      default:
        return statut;
    }
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case StatusSeance.PLANIFIEE:
        return 'status-planned';
      case StatusSeance.APPROUVEE:
        return 'status-approved';
      case StatusSeance.REALISEE:
        return 'status-completed';
      case StatusSeance.ANNULEE:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getDuree(): string {
    if (!this.seanceDetails?.heureDebut || !this.seanceDetails?.heureFin) return '';

    const debut = this.seanceDetails.heureDebut.split(':');
    const fin = this.seanceDetails.heureFin.split(':');

    const minutesDebut = parseInt(debut[0]) * 60 + parseInt(debut[1]);
    const minutesFin = parseInt(fin[0]) * 60 + parseInt(fin[1]);

    const dureeMinutes = minutesFin - minutesDebut;
    const heures = Math.floor(dureeMinutes / 60);
    const minutes = dureeMinutes % 60;

    if (heures > 0) {
      return minutes > 0 ? `${heures}h ${minutes}min` : `${heures}h`;
    } else {
      return `${minutes}min`;
    }
  }

  getStatutsDisponibles(): { value: string, label: string }[] {
    return [
      { value: StatusSeance.PLANIFIEE, label: 'Planifiée' },
      { value: StatusSeance.APPROUVEE, label: 'Approuvée' },
      { value: StatusSeance.REALISEE, label: 'Réalisée' },
      { value: StatusSeance.ANNULEE, label: 'Annulée' }
    ];
  }
}
