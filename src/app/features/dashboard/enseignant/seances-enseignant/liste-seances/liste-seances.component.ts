// src/app/features/dashboard/enseignant/seances-enseignant/liste-seances/liste-seances.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { SeanceService } from '../../../../../core/services/seance.service';
import { SeanceResponse } from '../../../../../core/dto/seance/seance-response';
import { StatusSeance } from '../../../../../core/enums/StatusSeance';
import { FiltresSeances } from '../seances-enseignant.component';

@Component({
  selector: 'app-liste-seances',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule],
  templateUrl: './liste-seances.component.html',
  styleUrls: ['./liste-seances.component.css']
})
export class ListeSeancesComponent implements OnChanges {
  @Input() filtres: FiltresSeances = {};
  @Output() seanceSelectionnee = new EventEmitter<SeanceResponse>();

  seances: SeanceResponse[] = [];
  isLoading = false;
  error: string | null = null;

  displayedColumns: string[] = [
    'date',
    'module',
    'heures',
    'numeroSeance',
    'statut',
    'actions'
  ];

  // Exposition de StatusSeance pour le template
  StatusSeance = StatusSeance;

  constructor(private seanceService: SeanceService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filtres']) {
      this.chargerSeances();
    }
  }

  chargerSeances(): void {
    this.isLoading = true;
    this.error = null;

    let observable;

    // Déterminer quelle méthode utiliser selon les filtres
    if (this.filtres.date) {
      // Filtre par date spécifique
      observable = this.seanceService.getMesSeancesParDate(this.filtres.date);
    } else if (this.filtres.dateDebut && this.filtres.dateFin) {
      // Filtre par période
      observable = this.seanceService.getMesSeancesParPeriode(this.filtres.dateDebut, this.filtres.dateFin);
    } else {
      // Toutes les séances
      observable = this.seanceService.getMesSeances();
    }

    observable.subscribe({
      next: (response) => {
        if (response.success) {
          this.seances = this.appliquerFiltresLocaux(response.data);
        } else {
          this.error = response.message || 'Erreur lors du chargement des séances';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Erreur lors du chargement des séances:', err);
      }
    });
  }

  private appliquerFiltresLocaux(seances: SeanceResponse[]): SeanceResponse[] {
    let seancesFiltrees = [...seances];

    // Filtre par module
    if (this.filtres.moduleId) {
      seancesFiltrees = seancesFiltrees.filter(seance => seance.moduleId === this.filtres.moduleId);
    }

    // Filtre par statut
    if (this.filtres.statut) {
      seancesFiltrees = seancesFiltrees.filter(seance => seance.statut === this.filtres.statut);
    }

    // Trier par date (plus récentes en premier)
    seancesFiltrees.sort((a, b) => {
      const dateA = new Date(this.formatDateForSort(a.date));
      const dateB = new Date(this.formatDateForSort(b.date));
      return dateB.getTime() - dateA.getTime();
    });

    return seancesFiltrees;
  }

  voirDetails(seance: SeanceResponse): void {
    this.seanceSelectionnee.emit(seance);
  }

  marquerCommeEffectuee(seance: SeanceResponse): void {
    const nouveauStatut = seance.statut === StatusSeance.REALISEE
      ? StatusSeance.PLANIFIEE
      : StatusSeance.REALISEE;

    this.seanceService.updateStatut(seance.id, nouveauStatut).subscribe({
      next: (response) => {
        if (response.success) {
          seance.statut = nouveauStatut;
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
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  private formatDateForSort(dateString: string): string {
    if (!dateString) return '';

    if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
      // Format dd-MM-yyyy vers yyyy-MM-dd
      const parts = dateString.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return dateString;
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

  isSeanceEffectuee(seance: SeanceResponse): boolean {
    return seance.statut === StatusSeance.REALISEE;
  }

  // Méthodes statistiques
  getTotalSeances(): number {
    return this.seances.length;
  }

  getSeancesEffectuees(): number {
    return this.seances.filter(seance => seance.statut === StatusSeance.REALISEE).length;
  }

  getSeancesPlanifiees(): number {
    return this.seances.filter(seance => seance.statut === StatusSeance.PLANIFIEE).length;
  }

  getTauxRealisation(): number {
    const total = this.getTotalSeances();
    if (total === 0) return 0;
    return Math.round((this.getSeancesEffectuees() / total) * 100);
  }
}
