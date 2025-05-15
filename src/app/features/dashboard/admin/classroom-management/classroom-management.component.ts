// classroom-management.component.ts
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassroomListComponent } from "./classroom-list/classroom-list.component";
import { ClassroomCreateComponent } from "./classroom-create/classroom-create.component";
import {ClasseResponse} from "../../../../core/dto/classe/classe-response";

@Component({
  selector: 'app-gestion-des-classrooms',
  templateUrl: './classroom-management.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ClassroomListComponent,
    ClassroomCreateComponent
  ],
  styleUrls: ['./classroom-management.component.css']
})
export class ClassroomManagementComponent {
  @ViewChild(ClassroomListComponent) listComponent!: ClassroomListComponent;

  showModal = false;
  classeToEdit: ClasseResponse | null = null;

  openModal() {
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    this.classeToEdit = null;
    document.body.style.overflow = 'auto';
  }

  onClassCreated() {
    this.closeModal();
    this.refreshClassList();
  }

  onClassUpdated() {
    this.closeModal();
    this.refreshClassList();
  }

  onEditClass(classe: ClasseResponse) {
    this.classeToEdit = classe;
    this.openModal();
  }

  refreshClassList() {
    if (this.listComponent) {
      this.listComponent.loadClasses();
    }
  }
}
