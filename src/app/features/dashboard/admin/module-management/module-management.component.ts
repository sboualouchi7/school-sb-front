import {Component, ViewChild} from '@angular/core';
import {NgIf} from "@angular/common";
import {ModuleListComponent} from "./module-list/module-list.component";
import {ModuleCreateComponent} from "./module-create/module-create.component";
import {ClasseResponse} from "../../../../core/dto/classe/classe-response";
import {ModuleResponse} from "../../../../core/dto/module/module-response";

@Component({
  selector: 'app-module-management',
  standalone: true,
  imports: [
    NgIf,
    ModuleListComponent,
    ModuleCreateComponent
  ],
  templateUrl: './module-management.component.html',
  styleUrl: './module-management.component.css'
})
export class ModuleManagementComponent {
  @ViewChild(ModuleListComponent) listComponent!: ModuleListComponent;

  showModal = false;
  moduleToEdit: ModuleResponse | null = null;

  openModal() {
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    this.moduleToEdit = null;
    document.body.style.overflow = 'auto';
  }

  onModuleCreated() {
    this.closeModal();
    this.refreshModuleList();
  }

  onModuleUpdated() {
    this.closeModal();
    this.refreshModuleList();
  }

  onEditModule(module: ModuleResponse) {
    this.moduleToEdit = module;
    this.openModal();
  }

  refreshModuleList() {
    if (this.listComponent) {
      this.listComponent.loadModules();
    }
  }
}
