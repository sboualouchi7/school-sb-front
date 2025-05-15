// import { Component, OnInit } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { ClasseGroup } from 'src/app/Models/ClasseGroup';
// import { EleveAbsenceDto } from 'src/app/Models/dto/EleveAbsenceDto';
// import { Eleve } from 'src/app/Models/eleve';
// import { AbsenceService } from 'src/app/Services/absence.service';
// import { classeGroupService } from 'src/app/Services/classe-group.service';
// import { EleveService } from 'src/app/Services/eleve.service';
//
// @Component({
//   selector: 'app-dash-admin-get-absences',
//   templateUrl: './absence-list.component.html',
//   standalone: true,
//   styleUrls: ['./absence-list.component.css']
// })
// export class AbsenceListComponent implements OnInit {
//   displayedColumns: string[] = ['identificationId', 'username',  'gender', 'age','totale'];
//   FromSearch!: FormGroup;
//   ListClasseGroup!: ClasseGroup[];
//   ListElevesAbsences!: EleveAbsenceDto[];
//
//   constructor(
//     private absenceService: AbsenceService,
//     private classeGroupService: classeGroupService,
//     private fb: FormBuilder
//   ) {}
//
//   ngOnInit(): void {
//     this.FromSearch = this.fb.group({
//       classeId: ['', Validators.required],
//     });
//
//
//     this.classeGroupService.getAllClasseGroup().subscribe((data) => {
//       this.ListClasseGroup = data;
//     });
//
//
//     this.absenceService.getAllAbsence().subscribe((data) => {
//       this.ListElevesAbsences = data;
//     });
//   }
//
//   search() {
//     if (this.FromSearch.valid) {
//       const selectedClassId = this.FromSearch.value.classeId;
//       this.absenceService.getAllAbsencesByClasseId(selectedClassId).subscribe((data) => {
//         this.ListElevesAbsences = data;
//       });
//     }
//   }
//
//   realod(){
//     this.ngOnInit();
//   }
// }
