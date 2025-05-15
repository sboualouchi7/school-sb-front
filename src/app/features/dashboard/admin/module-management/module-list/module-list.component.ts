import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { ModuleResponse } from "../../../../../core/dto/module/module-response";
import { ModuleService } from "../../../../../core/services/module.service";

@Component({
  selector: 'app-module-list',
  templateUrl: './module-list.component.html',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule],
  styleUrls: ['./module-list.component.css']
})
export class ModuleListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'libelle', 'typeModule', 'volumeHoraire', 'coefficient', 'nomClasse', 'nomEnseignant', 'actions'];
  listModules: ModuleResponse[] = [];

  showDeleteConfirmation = false;
  moduleIdToDelete: number | null = null;

  @Output() editModuleEvent = new EventEmitter<ModuleResponse>();

  constructor(private moduleService: ModuleService) {}

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.moduleService.getAllModules().subscribe(response => {
      this.listModules = response.data;
      console.log('Modules chargés:', response);
    });
  }

  editModule(module: ModuleResponse): void {
    this.editModuleEvent.emit(module);
  }

  deleteModule(id: number): void {
    this.moduleIdToDelete = id;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.moduleIdToDelete = null;
  }

  confirmDelete(): void {
    if (this.moduleIdToDelete) {
      this.moduleService.deleteModule(this.moduleIdToDelete).subscribe({
        next: (response) => {
          console.log('Module supprimée avec succès');
          this.loadModules();
          this.showDeleteConfirmation = false;
          this.moduleIdToDelete = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la module:', error);
          this.showDeleteConfirmation = false;
          this.moduleIdToDelete = null;
        }
      });
    }
  }
}
