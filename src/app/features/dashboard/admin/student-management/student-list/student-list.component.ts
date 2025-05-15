// student-list.component.ts
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ClasseResponse } from "../../../../../core/dto/classe/classe-response";
import { EtudiantResponse } from "../../../../../core/dto/etudiant/etudiant-response";
import { EtudiantService } from "../../../../../core/services/etudiant.service";
import { ClasseService } from "../../../../../core/services/classe.service";

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    DatePipe,
    CommonModule
  ],
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  // Ajout de la colonne "actions" dans les colonnes affichées
  displayedColumns: string[] = ['numeroEtudiant', 'nom', 'prenom', 'email', 'sexe', 'dateNaissance', 'actions'];
  FromSearch!: FormGroup;
  ListClasses: ClasseResponse[] = [];
  dataSource = new MatTableDataSource<EtudiantResponse>([]);

  // Variables pour la confirmation de suppression
  showDeleteConfirmation = false;
  etudiantIdToDelete: number | null = null;

  // Événement pour l'édition d'un étudiant
  @Output() editStudentEvent = new EventEmitter<EtudiantResponse>();

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private etudiantService: EtudiantService,
    private classeService: ClasseService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire de recherche
    this.FromSearch = this.fb.group({
      classeId: ['', Validators.required],
    });

    // Chargement des classes
    this.classeService.getAllClasses().subscribe({
      next: (response) => {
        this.ListClasses = response.data;
        console.log('Classes chargées:', response.data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des classes:', err);
      }
    });

    // Chargement des étudiants
    this.loadAllStudents();
  }

  ngAfterViewInit() {
    // Associer le tri à la source de données après l'initialisation de la vue
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  loadAllStudents() {
    this.etudiantService.getAllEtudiants().subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        console.log('Étudiants chargés:', response.data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des étudiants:', err);
      }
    });
  }

  search() {
    if (this.FromSearch.valid) {
      const selectedClassId = this.FromSearch.value.classeId;
      this.etudiantService.getEtudiantsByClasseId(selectedClassId).subscribe({
        next: (response) => {
          this.dataSource.data = response.data;
          console.log('Étudiants filtrés par classe:', response.data);
        },
        error: (err) => {
          console.error('Erreur lors du filtrage des étudiants:', err);
        }
      });
    }
  }

  reload() {
    this.FromSearch.reset();
    this.loadAllStudents();
  }

  // Méthode pour éditer un étudiant
  editStudent(etudiant: EtudiantResponse): void {
    this.editStudentEvent.emit(etudiant);
  }

  // Méthode pour demander confirmation avant suppression
  deleteStudent(id: number): void {
    this.etudiantIdToDelete = id;
    this.showDeleteConfirmation = true;
  }

  // Méthode pour annuler la suppression
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.etudiantIdToDelete = null;
  }

  // Méthode pour confirmer la suppression
  confirmDelete(): void {
    if (this.etudiantIdToDelete) {
      this.etudiantService.deleteEtudiant(this.etudiantIdToDelete).subscribe({
        next: (response) => {
          console.log('Étudiant supprimé avec succès');
          this.loadAllStudents(); // Recharger la liste après suppression
          this.showDeleteConfirmation = false;
          this.etudiantIdToDelete = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de l\'étudiant:', error);
          this.showDeleteConfirmation = false;
          this.etudiantIdToDelete = null;
        }
      });
    }
  }
}
