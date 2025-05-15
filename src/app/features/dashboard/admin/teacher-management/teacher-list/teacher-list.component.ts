// teacher-list.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ClasseResponse } from "../../../../../core/dto/classe/classe-response";
import { EnseignantResponse } from "../../../../../core/dto/enseignant/enseignant-response";
import { EnseignantService } from "../../../../../core/services/enseignant.service";
import { ClasseService } from "../../../../../core/services/classe.service";

@Component({
  selector: 'app-teacher-list',
  templateUrl: './teacher-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule
  ],
  styleUrls: ['./teacher-list.component.css']
})
export class TeacherListComponent implements OnInit {
  // Ajout de la colonne "actions" dans les colonnes affichées
  displayedColumns: string[] = ['numeroCarte', 'nom', 'prenom', 'email', 'sexe', 'dateNaissance', 'specialite', 'actions'];
  searchForm!: FormGroup;
  listeClasses!: ClasseResponse[];
  listeEnseignants!: EnseignantResponse[];

  // Variables pour la confirmation de suppression
  showDeleteConfirmation = false;
  enseignantIdToDelete: number | null = null;

  // Événement pour communiquer avec le composant parent
  @Output() editTeacherEvent = new EventEmitter<EnseignantResponse>();

  constructor(
    private enseignantService: EnseignantService,
    private classeService: ClasseService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      departementId: ['', Validators.required],
    });

    this.classeService.getAllClasses().subscribe((response) => {
      this.listeClasses = response.data;
    });

    this.loadAllTeachers();
  }

  loadAllTeachers() {
    this.enseignantService.getAllEnseignants().subscribe((response) => {
      this.listeEnseignants = response.data;
    });
  }

  search() {
    if (this.searchForm.valid) {
      const selectedDepartementId = this.searchForm.value.departementId;
      this.enseignantService.getByDepartement(selectedDepartementId).subscribe((response) => {
        this.listeEnseignants = response.data;
      });
    }
  }

  reload() {
    this.loadAllTeachers();
    this.searchForm.reset();
  }

  // Méthode pour éditer un enseignant
  editTeacher(enseignant: EnseignantResponse): void {
    this.editTeacherEvent.emit(enseignant);
  }

  // Méthode pour demander confirmation avant suppression
  deleteTeacher(id: number): void {
    this.enseignantIdToDelete = id;
    this.showDeleteConfirmation = true;
  }

  // Méthode pour annuler la suppression
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.enseignantIdToDelete = null;
  }

  // Méthode pour confirmer la suppression
  confirmDelete(): void {
    if (this.enseignantIdToDelete) {
      this.enseignantService.delete(this.enseignantIdToDelete).subscribe({
        next: (response) => {
          console.log('Enseignant supprimé avec succès');
          this.loadAllTeachers(); // Recharger la liste après suppression
          this.showDeleteConfirmation = false;
          this.enseignantIdToDelete = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de l\'enseignant:', error);
          this.showDeleteConfirmation = false;
          this.enseignantIdToDelete = null;
        }
      });
    }
  }
}
