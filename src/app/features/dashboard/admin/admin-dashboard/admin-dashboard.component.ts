import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EtudiantService } from '../../../../core/services/etudiant.service';
import { ModuleService } from '../../../../core/services/module.service';
import { ClasseService } from '../../../../core/services/classe.service';
import { EnseignantService } from '../../../../core/services/enseignant.service';
import { DocumentService } from '../../../../core/services/document.service';
import { SeanceService } from '../../../../core/services/seance.service';
import { StatusSeance } from '../../../../core/enums/StatusSeance';
import { StatusDocument } from '../../../../core/enums/StatusDocument';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Statistiques
  totalEtudiants = 0;
  totalModules = 0;
  totalClasses = 0;
  totalEnseignants = 0;
  totalDocumentsEnAttente = 0;
  totalSeancesEffectuees = 0;

  // Indicateurs de chargement
  isLoading = true;
  hasError = false;
  errorMessage = '';

  constructor(
    private etudiantService: EtudiantService,
    private moduleService: ModuleService,
    private classeService: ClasseService,
    private enseignantService: EnseignantService,
    private documentService: DocumentService,
    private seanceService: SeanceService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;

    // Utilisation de forkJoin pour exécuter toutes les requêtes en parallèle
    forkJoin({
      etudiants: this.etudiantService.getAllEtudiants(),
      modules: this.moduleService.getAllModules(),
      classes: this.classeService.getAllClasses(),
      enseignants: this.enseignantService.getAllEnseignants(),
      documents: this.documentService.getAllDocuments(),
      seances: this.seanceService.getAllSeances()
    }).subscribe({
      next: (results) => {
        // Traitement des résultats
        if (results.etudiants.success) {
          this.totalEtudiants = results.etudiants.data.length;
        }

        if (results.modules.success) {
          this.totalModules = results.modules.data.length;
        }

        if (results.classes.success) {
          this.totalClasses = results.classes.data.length;
        }

        if (results.enseignants.success) {
          this.totalEnseignants = results.enseignants.data.length;
        }

        if (results.documents.success) {
          // Filtrer les documents en attente (DEMANDE ou EN_TRAITEMENT)
          this.totalDocumentsEnAttente = results.documents.data.filter(
            doc => doc.status === StatusDocument.DEMANDE || doc.status === StatusDocument.EN_TRAITEMENT
          ).length;
        }

        if (results.seances.success) {
          // Compter les séances effectuées (statut REALISEE)
          this.totalSeancesEffectuees = results.seances.data.filter(
            seance => seance.statut === StatusSeance.REALISEE
          ).length;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données du dashboard', error);
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Impossible de charger les données du dashboard. Veuillez réessayer plus tard.';
      }
    });
  }
}
