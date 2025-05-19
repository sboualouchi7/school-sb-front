// summary-table.component.ts
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { ClasseService } from '../../../../../core/services/classe.service';
import { EtudiantService } from '../../../../../core/services/etudiant.service';
import { ClasseResponse } from '../../../../../core/dto/classe/classe-response';

interface ClasseSummary {
  id: number;
  nom: string;
  niveau: string;
  capacite: number;
  effectif: number;
  tauxRemplissage: number;
  nombreModules: number;
}

@Component({
  selector: 'app-summary-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule],
  templateUrl: './summary-table.component.html',
  styleUrls: ['./summary-table.component.css']
})
export class SummaryTableComponent implements OnInit, OnChanges {
  @Input() filters: any = {};

  displayedColumns: string[] = ['nom', 'niveau', 'effectif', 'capacite', 'tauxRemplissage', 'nombreModules'];
  dataSource: ClasseSummary[] = [];
  loading = true;
  error = false;

  constructor(
    private classeService: ClasseService,
    private etudiantService: EtudiantService
  ) {}

  ngOnInit(): void {
    this.loadSummaryData();
  }

  ngOnChanges(): void {
    this.loadSummaryData();
  }

  protected async loadSummaryData(): Promise<void> {
    this.loading = true;
    this.error = false;

    try {
      // Charger toutes les classes
      const classesResponse = await this.classeService.getAllClasses().toPromise();

      if (!classesResponse?.success) {
        throw new Error('Impossible de charger les classes');
      }

      const classes = classesResponse.data;
      const summaryData: ClasseSummary[] = [];

      // Pour chaque classe, récupérer les étudiants
      for (const classe of classes) {
        try {
          const etudiantsResponse = await this.etudiantService.getEtudiantsByClasseId(classe.id).toPromise();
          const nombreEtudiants = etudiantsResponse?.success ? etudiantsResponse.data.length : 0;

          const tauxRemplissage = classe.capacite > 0
            ? Math.round((nombreEtudiants / classe.capacite) * 100)
            : 0;

          summaryData.push({
            id: classe.id,
            nom: classe.nom,
            niveau: classe.labelNiveau || 'Non défini',
            capacite: classe.capacite,
            effectif: nombreEtudiants,
            tauxRemplissage: tauxRemplissage,
            nombreModules: 0 // À implémenter si nécessaire
          });
        } catch (error) {
          console.error(`Erreur pour la classe ${classe.nom}:`, error);
          // Continuer avec les données disponibles
          summaryData.push({
            id: classe.id,
            nom: classe.nom,
            niveau: classe.labelNiveau || 'Non défini',
            capacite: classe.capacite,
            effectif: 0,
            tauxRemplissage: 0,
            nombreModules: 0
          });
        }
      }

      this.dataSource = summaryData;
    } catch (error) {
      console.error('Erreur lors du chargement des données récapitulatives:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  getTauxRemplissageClass(taux: number): string {
    if (taux >= 90) return 'taux-high';
    if (taux >= 70) return 'taux-medium';
    if (taux >= 50) return 'taux-low';
    return 'taux-empty';
  }

  getTotalEffectif(): number {
    return this.dataSource.reduce((total, classe) => total + classe.effectif, 0);
  }

  getTotalCapacite(): number {
    return this.dataSource.reduce((total, classe) => total + classe.capacite, 0);
  }

  getMoyenneTauxRemplissage(): number {
    if (this.dataSource.length === 0) return 0;
    const moyenne = this.dataSource.reduce((total, classe) => total + classe.tauxRemplissage, 0) / this.dataSource.length;
    return Math.round(moyenne);
  }
}
