// features/dashboard/enseignant/gestion-notes/selection-module/selection-module.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleService } from '../../../../../core/services/module.service';
import { ModuleResponse } from '../../../../../core/dto/module/module-response';

@Component({
  selector: 'app-selection-module',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selection-module.component.html',
  styleUrls: ['./selection-module.component.css']
})
export class SelectionModuleComponent implements OnInit {
  @Output() moduleSelectionne = new EventEmitter<ModuleResponse>();

  modules: ModuleResponse[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private moduleService: ModuleService) {}

  ngOnInit(): void {
    this.chargerModules();
  }

  chargerModules(): void {
    this.isLoading = true;
    this.error = null;

    // Utiliser la méthode qui récupère les modules de l'enseignant connecté
    this.moduleService.getMesModules().subscribe({
      next: (response) => {
        if (response.success) {
          this.modules = response.data;
          console.log('Modules chargés:', this.modules);
        } else {
          this.error = response.message || 'Erreur lors du chargement des modules';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Erreur lors du chargement des modules:', err);
      }
    });
  }

  selectionnerModule(module: ModuleResponse): void {
    this.moduleSelectionne.emit(module);
  }
}
