// src/app/features/dashboard/admin/admin-routing.module.ts
import {RouterModule, Routes} from '@angular/router';
import {NgModule} from "@angular/core";
import {StudentManagementComponent} from "./student-management/student-management.component";
import {TeacherManagementComponent} from "./teacher-management/teacher-management.component";
import {ClassroomManagementComponent} from "./classroom-management/classroom-management.component";
import {ParentManagmentComponent} from "./parent-managment/parent-managment.component";
import {SessionManagmentComponent} from "./session-managment/session-managment.component";
import {ModuleManagementComponent} from "./module-management/module-management.component";
import {EvaluationManagementComponent} from "./Evaluation-management/Evaluation-management.component";
import { AbsenceManagementComponent } from './absence-management/absence-management.component';
import { DocumentManagementComponent } from './document-management/document-management.component';
import { SeanceManagementComponent } from './seance-management/seance-management.component';

export const AdminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'student',
    pathMatch: 'full'
  },
  { path: 'student',
    component: StudentManagementComponent
  },
  { path: 'profs',
    component: TeacherManagementComponent
  },
  { path: 'classe',
    component: ClassroomManagementComponent
  },
  { path: 'module',
    component: ModuleManagementComponent
  },
  { path: 'parent',
    component: ParentManagmentComponent
  },
  { path: 'evaluations',
    component: EvaluationManagementComponent
  },
  {
    path: 'absences',
    component: AbsenceManagementComponent
  },
  {
    path: 'documents',
    component: DocumentManagementComponent
  },
  {
    path: 'seances',
    component: SeanceManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(AdminRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
