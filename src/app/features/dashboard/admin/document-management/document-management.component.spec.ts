import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentService } from '../../../../core/services/document.service';
import { EtudiantService } from '../../../../core/services/etudiant.service';
import { DocumentRequest } from '../../../../core/dto/document/document-request';
import { DocumentResponse } from '../../../../core/dto/document/document-response';
import { EtudiantResponse } from '../../../../core/dto/etudiant/etudiant-response';
import { StatusDocument } from '../../../../core/enums/StatusDocument';
import { TypeDocument } from '../../../../core/enums/TypeDocument';
import { AuthService } from '../../../../core/services/auth-service';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-document-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule
  ],
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.css']
})
export class DocumentManagementComponent implements OnInit {
  documentForm!: FormGroup;
  searchForm!: FormGroup;
  documents: DocumentResponse[] = [];
  etudiants: EtudiantResponse[] = [];
  filteredEtudiants: EtudiantResponse[] = [];
  selectedEtudiant: EtudiantResponse | null = null;
  showAddForm = false;

  // Valeurs d'énumération pour les templates
  statusOptions = Object.values(StatusDocument);
  typeOptions = Object.values(TypeDocument);

  displayedColumns: string[] = ['id', 'nomEtudiant', 'type', 'dateCreation', 'status', 'actions'];
  searchPerformed = false;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private etudiantService: EtudiantService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initSearchForm();
    this.initDocumentForm();
    this.loadAllDocuments();
    this.loadAllEtudiants();
  }

  initSearchForm(): void {
    this.searchForm = this.fb.group({
      searchTerm: ['', Validators.required]
    });
  }

  initDocumentForm(): void {
    this.documentForm = this.fb.group({
      etudiantId: ['', Validators.required],
      type: [TypeDocument.ATTESTATION, Validators.required],
      commentaire: ['']
    });
  }

  loadAllDocuments(): void {
    this.documentService.getAllDocuments().subscribe({
      next: (response) => {
        if (response.success) {
          this.documents = response.data;
        } else {
          console.error('Erreur lors du chargement des documents:', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des documents:', error);
      }
    });
  }

  loadAllEtudiants(): void {
    this.etudiantService.getAllEtudiants().subscribe({
      next: (response) => {
        if (response.success) {
          this.etudiants = response.data;
        } else {
          console.error('Erreur lors du chargement des étudiants:', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des étudiants:', error);
      }
    });
  }

  searchEtudiants(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value.toLowerCase();
    this.searchPerformed = true;

    if (!searchTerm) {
      this.filteredEtudiants = [];
      return;
    }

    this.filteredEtudiants = this.etudiants.filter(etudiant =>
      etudiant.nom.toLowerCase().includes(searchTerm) ||
      etudiant.prenom.toLowerCase().includes(searchTerm) ||
      etudiant.numeroEtudiant.toLowerCase().includes(searchTerm)
    );
  }

  selectEtudiant(etudiant: EtudiantResponse): void {
    this.selectedEtudiant = etudiant;
    this.documentForm.patchValue({
      etudiantId: etudiant.id
    });
    this.filteredEtudiants = [];
    this.searchForm.patchValue({
      searchTerm: `${etudiant.nom} ${etudiant.prenom} (${etudiant.numeroEtudiant})`
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetDocumentForm();
      this.selectedEtudiant = null;
      this.searchForm.reset();
    }
  }

  resetDocumentForm(): void {
    this.documentForm.reset({
      type: TypeDocument.ATTESTATION
    });
  }

  submitDocument(): void {
    if (this.documentForm.valid) {
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        console.error('Impossible de récupérer l\'ID de l\'utilisateur actuel');
        return;
      }

      const documentRequest: DocumentRequest = {
        etudiantId: this.documentForm.value.etudiantId,
        demandeurId: currentUserId,
        type: this.documentForm.value.type,
        commentaire: this.documentForm.value.commentaire
      };

      this.documentService.createDocument(documentRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadAllDocuments();
            this.toggleAddForm();
          } else {
            console.error('Erreur lors de la création du document:', response.message);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création du document:', error);
        }
      });
    }
  }

  updateDocumentStatus(documentId: number, newStatus: StatusDocument): void {
    this.documentService.updateStatus(documentId, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadAllDocuments();
        } else {
          console.error('Erreur lors de la mise à jour du statut:', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    });
  }

  deleteDocument(documentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande de document ?')) {
      this.documentService.deleteDocument(documentId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadAllDocuments();
          } else {
            console.error('Erreur lors de la suppression du document:', response.message);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du document:', error);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case StatusDocument.DEMANDE:
        return 'status-pending';
      case StatusDocument.EN_TRAITEMENT:
        return 'status-processing';
      case StatusDocument.PRET:
        return 'status-ready';
      case StatusDocument.ARCHIVE:
        return 'status-archived';
      default:
        return '';
    }
  }
  getNextStatusLabel(currentStatus: string): string {
    switch (currentStatus) {
      case StatusDocument.DEMANDE:
        return 'Traiter';
      case StatusDocument.EN_TRAITEMENT:
        return 'Marquer prêt';
      case StatusDocument.PRET:
        return 'Archiver';
      default:
        return 'Suivant';
    }
  }
  formatDocumentType(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatDocumentStatus(status: string): string {
    switch (status) {
      case StatusDocument.DEMANDE:
        return 'Demandé';
      case StatusDocument.EN_TRAITEMENT:
        return 'En traitement';
      case StatusDocument.PRET:
        return 'Prêt';
      case StatusDocument.ARCHIVE:
        return 'Archivé';
      default:
        return status;
    }
  }

  getNextStatus(currentStatus: string): StatusDocument {
    switch (currentStatus) {
      case StatusDocument.DEMANDE:
        return StatusDocument.EN_TRAITEMENT;
      case StatusDocument.EN_TRAITEMENT:
        return StatusDocument.PRET;
      case StatusDocument.PRET:
        return StatusDocument.ARCHIVE;
      default:
        return StatusDocument.DEMANDE;
    }
  }

  // Méthode pour obtenir l'ID de l'utilisateur connecté
  getCurrentUserId(): number | null {
    const currentUser = this.authService.currentUserSubject.value;
    return currentUser ? currentUser.id : null;
  }
}
