// student-management.component.ts
import { Component, ViewChild } from '@angular/core';
import { StudentCreateComponent } from "./student-create/student-create.component";
import { StudentListComponent } from "./student-list/student-list.component";
import { CommonModule } from "@angular/common";
import {EtudiantResponse} from "../../../../core/dto/etudiant/etudiant-response";

@Component({
  selector: 'app-gestion-admin-eleve',
  templateUrl: './student-management.component.html',
  standalone: true,
  imports: [
    StudentCreateComponent,
    StudentListComponent,
    CommonModule
  ],
  styleUrls: ['./student-management.component.css']
})
export class StudentManagementComponent {
  @ViewChild(StudentListComponent) listComponent!: StudentListComponent;

  showModal = false;
  etudiantToEdit: EtudiantResponse | null = null;

  openModal() {
    this.showModal = true;
    document.body.style.overflow = 'hidden'; // Empêcher le défilement de la page
  }

  closeModal() {
    this.showModal = false;
    this.etudiantToEdit = null;
    document.body.style.overflow = 'auto'; // Restaurer le défilement de la page
  }

  onStudentCreated() {
    this.closeModal();
    this.refreshStudentList();
  }

  onStudentUpdated() {
    this.closeModal();
    this.refreshStudentList();
  }

  onEditStudent(etudiant: EtudiantResponse) {
    this.etudiantToEdit = etudiant;
    this.openModal();
  }

  refreshStudentList() {
    // Rafraîchir la liste des étudiants
    if (this.listComponent) {
      this.listComponent.loadAllStudents();
    }
  }
}
