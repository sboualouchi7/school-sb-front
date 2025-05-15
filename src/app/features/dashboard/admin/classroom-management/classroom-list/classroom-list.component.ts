// classroom-list.component.ts
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { ClasseResponse } from "../../../../../core/dto/classe/classe-response";
import { ClasseService } from "../../../../../core/services/classe.service";

@Component({
  selector: 'app-classroom-list',
  templateUrl: './classroom-list.component.html',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule],
  styleUrls: ['./classroom-list.component.css']
})
export class ClassroomListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nom', 'labelNiveau', 'capacite', 'anneeScolaire', 'actions'];
  listClasses: ClasseResponse[] = [];

  showDeleteConfirmation = false;
  classeIdToDelete: number | null = null;

  @Output() editClasseEvent = new EventEmitter<ClasseResponse>();

  constructor(private classeService: ClasseService) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.classeService.getAllClasses().subscribe(response => {
      this.listClasses = response.data;
      console.log('Classes chargées:', response);
    });
  }

  editClasse(classe: ClasseResponse): void {
    this.editClasseEvent.emit(classe);
  }

  deleteClasse(id: number): void {
    this.classeIdToDelete = id;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.classeIdToDelete = null;
  }

  confirmDelete(): void {
    if (this.classeIdToDelete) {
      this.classeService.deleteClasse(this.classeIdToDelete).subscribe({
        next: (response) => {
          console.log('Classe supprimée avec succès');
          this.loadClasses();
          this.showDeleteConfirmation = false;
          this.classeIdToDelete = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la classe:', error);
          this.showDeleteConfirmation = false;
          this.classeIdToDelete = null;
        }
      });
    }
  }
}
