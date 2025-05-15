// parent-management.component.ts
import { Component, ViewChild } from '@angular/core';
import { ParentListComponent } from "./parent-list/parent-list.component";
import { ParentCreateComponent } from "./parent-create/parent-create.component";
import { CommonModule } from "@angular/common";
import {ParentResponse} from "../../../../core/dto/parent/parent-response";

@Component({
  selector: 'app-parent-managment',
  templateUrl: './parent-managment.component.html',
  standalone: true,
  imports: [
    ParentListComponent,
    ParentCreateComponent,
    CommonModule
  ],
  styleUrls: ['./parent-managment.component.css']
})
export class ParentManagmentComponent {
  @ViewChild(ParentListComponent) listComponent!: ParentListComponent;

  showModal = false;
  parentToEdit: ParentResponse | null = null;

  openModal() {
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    this.parentToEdit = null;
    document.body.style.overflow = 'auto';
  }

  onParentCreated() {
    this.closeModal();
    this.refreshParentList();
  }


  onParentUpdated() {
    this.closeModal();
    this.refreshParentList();
  }

  onEditParent(parent: ParentResponse) {
    this.parentToEdit = parent;
    this.openModal();
  }

  refreshParentList() {
    // Rafraîchir la liste des parents
    if (this.listComponent) {
      this.listComponent.loadParents();
    }
  }
}
