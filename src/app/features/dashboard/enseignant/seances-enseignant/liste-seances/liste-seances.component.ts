// src/app/features/dashboard/enseignant/seances-enseignant/liste-seances/liste-seances.component.ts
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
export class ListeSeancesComponent implements OnInit, OnChanges {
  @Input() filtres: FiltresSeances = {};
  @Output() seanceSelectionnee = new EventEmitter<SeanceResponse>();

  seances: SeanceResponse[] = [];
  seancesOriginales: SeanceResponse[] = []; // Pour garder une copie de toutes les séances
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

  ngOnInit(): void {
    // Charger toutes les séances au démarrage
    this.chargerToutesLesSeances();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filtres'] && !changes['filtres'].firstChange) {
      console.log('Filtres changés:', this.filtres);
      this.appliquerFiltres();
    }
  }

  chargerToutesLesSeances(): void {
    this.isLoading = true;
    this.error = null;

    console.log('Chargement de toutes les séances...');

    this.seanceService.getMesSeances().subscribe({
      next: (response) => {
        console.log('Réponse du service séances:', response);
        if (response.success) {
          this.seancesOriginales = response.data || [];
          console.log('Séances originales chargées:', this.seancesOriginales.length);
          this.appliquerFiltres();
        } else {
          this.error = response.message || 'Erreur lors du chargement des séances';
          console.error('Erreur dans la réponse:', this.error);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur de connexion au serveur';
        console.error('Erreur lors du chargement des séances:', err);
        this.isLoading = false;
      }
    });
  }

  chargerSeances(): void {
    // Cette méthode est gardée pour compatibilité mais utilise maintenant la logique de filtrage
    this.appliquerFiltres();
  }

  private appliquerFiltres(): void {
    console.log('Application des filtres:', this.filtres);

    if (!this.seancesOriginales || this.seancesOriginales.length === 0) {
      console.log('Aucune séance originale disponible');
      this.seances = [];
      return;
    }

    let seancesFiltrees = [...this.seancesOriginales];
    console.log('Séances avant filtrage:', seancesFiltrees.length);

    // Filtre par date spécifique
    if (this.filtres.date) {
      const dateFiltre = this.filtres.date;
      seancesFiltrees = seancesFiltrees.filter(seance => {
        const dateSeance = this.normaliserDate(seance.date);
        return dateSeance === dateFiltre;
      });
      console.log(`Après filtre par date ${dateFiltre}:`, seancesFiltrees.length);
    }

    // Filtre par période
    else if (this.filtres.dateDebut && this.filtres.dateFin) {
      const dateDebut = this.filtres.dateDebut;
      const dateFin = this.filtres.dateFin;

      seancesFiltrees = seancesFiltrees.filter(seance => {
        const dateSeance = this.normaliserDate(seance.date);
        return dateSeance >= dateDebut && dateSeance <= dateFin;
      });
      console.log(`Après filtre par période ${dateDebut} - ${dateFin}:`, seancesFiltrees.length);
    }

    // Filtre par module
    if (this.filtres.moduleId) {
      const moduleIdFiltre = this.filtres.moduleId;
      seancesFiltrees = seancesFiltrees.filter(seance => {
        const moduleMatch = seance.moduleId === moduleIdFiltre;
        console.log(`Séance ${seance.id}: moduleId=${seance.moduleId}, filtre=${moduleIdFiltre}, match=${moduleMatch}`);
        return moduleMatch;
      });
      console.log(`Après filtre par module ${moduleIdFiltre}:`, seancesFiltrees.length);
    }

    // Filtre par statut
    if (this.filtres.statut) {
      const statutFiltre = this.filtres.statut;
      seancesFiltrees = seancesFiltrees.filter(seance => seance.statut === statutFiltre);
      console.log(`Après filtre par statut ${statutFiltre}:`, seancesFiltrees.length);
    }

    // Trier par date (plus récentes en premier)
    seancesFiltrees.sort((a, b) => {
      const dateA = new Date(this.formatDateForSort(a.date));
      const dateB = new Date(this.formatDateForSort(b.date));
      return dateB.getTime() - dateA.getTime();
    });

    this.seances = seancesFiltrees;
    console.log('Séances finales après filtrage et tri:', this.seances.length);
  }

  private normaliserDate(dateString: string): string {
    if (!dateString) return '';

    if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
      // Format dd-MM-yyyy vers yyyy-MM-dd
      const parts = dateString.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return dateString;
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
          // Mettre à jour dans les deux listes
          seance.statut = nouveauStatut;
          const indexOriginal = this.seancesOriginales.findIndex(s => s.id === seance.id);
          if (indexOriginal !== -1) {
            this.seancesOriginales[indexOriginal].statut = nouveauStatut;
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
