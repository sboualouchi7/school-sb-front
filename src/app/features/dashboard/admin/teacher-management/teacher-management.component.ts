// teacher-management.component.ts
import { Component, ViewChild } from '@angular/core';
import { TeacherListComponent } from "./teacher-list/teacher-list.component";
import { TeacherCreateComponent } from "./teacher-create/teacher-create.component";
import { CommonModule } from "@angular/common";
import {EnseignantResponse} from "../../../../core/dto/enseignant/enseignant-response";

@Component({
  selector: 'app-gestion-des-profs',
  templateUrl: './teacher-management.component.html',
  standalone: true,
  imports: [
    TeacherListComponent,
    TeacherCreateComponent,
    CommonModule
  ],
  styleUrls: ['./teacher-management.component.css']
})
export class TeacherManagementComponent {
  @ViewChild(TeacherListComponent) listComponent!: TeacherListComponent;

  showModal = false;
  enseignantToEdit: EnseignantResponse | null = null;

  openModal() {
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    this.enseignantToEdit = null;
    document.body.style.overflow = 'auto';
  }

  onTeacherCreated() {
    this.closeModal();
    this.refreshTeacherList();
  }

  onTeacherUpdated() {
    this.closeModal();
    this.refreshTeacherList();
  }

  onEditTeacher(enseignant: EnseignantResponse) {
    this.enseignantToEdit = enseignant;
    this.openModal();
  }

  refreshTeacherList() {
    // Rafraîchir la liste des enseignants
    if (this.listComponent) {
      this.listComponent.loadAllTeachers();
    }
  }
}
