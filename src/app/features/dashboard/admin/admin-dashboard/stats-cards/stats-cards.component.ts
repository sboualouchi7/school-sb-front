// stats-cards.component.ts
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClasseService } from '../../../../../core/services/classe.service';
import { EtudiantService } from '../../../../../core/services/etudiant.service';
import { ParentService } from '../../../../../core/services/parent.service';
import { DocumentService } from '../../../../../core/services/document.service';
import { SeanceService } from '../../../../../core/services/seance.service';
import { ModuleService } from '../../../../../core/services/module.service';
import { StatusSeance } from '../../../../../core/enums/StatusSeance';

interface StatsData {
  classes: number;
  etudiants: number;
  parents: number;
  documents: number;
  seances: number;
  modules: number;
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.css']
})
export class StatsCardsComponent implements OnInit, OnChanges {
  @Input() filters: any = {};

  stats: StatsData = {
    classes: 0,
    etudiants: 0,
    parents: 0,
    documents: 0,
    seances: 0,
    modules: 0
  };

  loading = true;
  error = false;

  constructor(
    private classeService: ClasseService,
    private etudiantService: EtudiantService,
    private parentService: ParentService,
    private documentService: DocumentService,
    private seanceService: SeanceService,
    private moduleService: ModuleService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnChanges(): void {
    this.loadStats();
  }

  protected async loadStats(): Promise<void> {
    this.loading = true;
    this.error = false;

    try {
      const [classes, etudiants, parents, documents, seances, modules] = await Promise.all([
        this.classeService.getAllClasses().toPromise(),
        this.etudiantService.getAllEtudiants().toPromise(),
        this.parentService.getAllParents().toPromise(),
        this.documentService.getAllDocuments().toPromise(),
        this.seanceService.getSeancesByStatut(StatusSeance.REALISEE).toPromise(),
        this.moduleService.getAllModules().toPromise()
      ]);

      this.stats = {
        classes: classes?.success ? classes.data.length : 0,
        etudiants: etudiants?.success ? etudiants.data.length : 0,
        parents: parents?.success ? parents.data.length : 0,
        documents: documents?.success ? documents.data.length : 0,
        seances: seances?.success ? seances.data.length : 0,
        modules: modules?.success ? modules.data.length : 0
      };
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  getCards() {
    return [
      {
        title: 'Classes',
        value: this.stats.classes,
        icon: 'pi pi-sitemap',
        color: 'primary',
        description: 'Total des classes'
      },
      {
        title: 'Étudiants',
        value: this.stats.etudiants,
        icon: 'pi pi-users',
        color: 'success',
        description: 'Étudiants inscrits'
      },
      {
        title: 'Parents',
        value: this.stats.parents,
        icon: 'pi pi-user',
        color: 'info',
        description: 'Parents enregistrés'
      },
      {
        title: 'Documents',
        value: this.stats.documents,
        icon: 'pi pi-file',
        color: 'warning',
        description: 'Demandes de documents'
      },
      {
        title: 'Séances',
        value: this.stats.seances,
        icon: 'pi pi-calendar-check',
        color: 'success',
        description: 'Séances effectuées'
      },
      {
        title: 'Modules',
        value: this.stats.modules,
        icon: 'pi pi-book',
        color: 'primary',
        description: 'Modules disponibles'
      }
    ];
  }
}
