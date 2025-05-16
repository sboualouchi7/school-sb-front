// features/dashboard/enseignant/gestion-notes/selection-classe/selection-classe.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleService } from '../../../../../core/services/module.service';
import { ClasseResponse } from '../../../../../core/dto/classe/classe-response';

@Component({
  selector: 'app-selection-classe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selection-classe.component.html',
  styleUrls: ['./selection-classe.component.css']
})
export class SelectionClasseComponent implements OnInit {
  @Input() moduleId!: number;
  @Output() classeSelectionnee = new EventEmitter<ClasseResponse>();
  @Output() retour = new EventEmitter<void>();

  classes: ClasseResponse[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private moduleService: ModuleService) {}

  ngOnInit(): void {
    this.chargerClasses();
  }

  chargerClasses(): void {
    this.isLoading = true;
    this.error = null;

    this.moduleService.getClassesByModule(this.moduleId).subscribe({
      next: (response) => {
        if (response.success) {
          this.classes = response.data;
        } else {
          this.error = response.message || 'Erreur lors du chargement des classes';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Erreur lors du chargement des classes:', err);
      }
    });
  }

  selectionnerClasse(classe: ClasseResponse): void {
    this.classeSelectionnee.emit(classe);
  }

  retourSelectionModule(): void {
    this.retour.emit();
  }
}
