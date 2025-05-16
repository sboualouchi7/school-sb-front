// features/dashboard/enseignant/gestion-notes/tableau-notes/tableau-notes.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { EvaluationService } from '../../../../../core/services/evaluation.service';
import { AuthService } from '../../../../../core/services/auth-service';
import { EtudiantAvecNotes, ColonneEvaluation, EvaluationTableau } from '../../../../../core/models/evaluation-tableau-interface';
import { EvaluationRequest } from '../../../../../core/dto/evaluation/evaluation-request';
import { TypeEvaluation } from '../../../../../core/enums/TypeEvaluation';

@Component({
  selector: 'app-tableau-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatSortModule],
  templateUrl: './tableau-notes.component.html',
  styleUrls: ['./tableau-notes.component.css']
})
export class TableauNotesComponent implements OnInit {
  @Input() moduleId!: number;
  @Input() classeId!: number;
  @Output() retour = new EventEmitter<void>();

  etudiants: EtudiantAvecNotes[] = [];
  colonnes: ColonneEvaluation[] = [];
  isLoading = false;
  isEnregistrement = false;
  error: string | null = null;
  successMessage: string | null = null;

  displayedColumns: string[] = [];
  enseignantId:
