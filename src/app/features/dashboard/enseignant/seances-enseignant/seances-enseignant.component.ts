// src/app/features/dashboard/enseignant/seances-enseignant/seances-enseignant.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListeSeancesComponent } from './liste-seances/liste-seances.component';
import { FiltresSeancesComponent } from './filtres-seances/filtres-seances.component';
import { DetailSeanceComponent } from './detail-seance/detail-seance.component';
import { SeanceResponse } from '../../../../core/dto/seance/seance-response';

export interface FiltresSeances {
  dateDebut?: string;
  dateFin?: string;
  date?: string;
  statut?: string;
  moduleId?: number;
}

@Component({
  selector: 'app-seances-enseignant',
  standalone: true,
  imports: [
    CommonModule,
    ListeSeancesComponent,
    FiltresSeancesComponent,
    DetailSeanceComponent
  ],
  templateUrl: './seances-enseignant.component.html',
  styleUrls: ['./seances-enseignant.component.css']
})
export class SeancesEnseignantComponent implements OnInit {
  filtresActuels: FiltresSeances = {};
  seanceSelectionnee: SeanceResponse | null = null;
  showDetailModal = false;

  ngOnInit(): void {
    // Initialiser avec les filtres par défaut (semaine courante)
    this.initialiserFiltresParDefaut();
  }

  private initialiserFiltresParDefaut(): void {
    const aujourdhui = new Date();
    const lundiSemaine = new Date(aujourdhui);
    lundiSemaine.setDate(aujourdhui.getDate() - aujourdhui.getDay() + 1);

    const dimancheSemaine = new Date(lundiSemaine);
    dimancheSemaine.setDate(lundiSemaine.getDate() + 6);

    this.filtresActuels = {
      dateDebut: lundiSemaine.toISOString().split('T')[0],
      dateFin: dimancheSemaine.toISOString().split('T')[0]
    };
  }

  onFiltresChange(filtres: FiltresSeances): void {
    this.filtresActuels = filtres;
  }

  onSeanceSelectionnee(seance: SeanceResponse): void {
    this.seanceSelectionnee = seance;
    this.showDetailModal = true;
  }

  onCloseDetailModal(): void {
    this.showDetailModal = false;
    this.seanceSelectionnee = null;
  }
}
