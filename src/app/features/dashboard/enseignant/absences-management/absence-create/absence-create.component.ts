// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ClasseGroup } from 'src/app/Models/ClasseGroup';
// import { Absence } from 'src/app/Models/absence';
// import { Eleve } from 'src/app/Models/eleve';
// import { AbsenceService } from 'src/app/Services/absence.service';
// import { classeGroupService } from 'src/app/Services/classe-group.service';
// import { EleveService } from 'src/app/Services/eleve.service';
//
// @Component({
//   selector: 'app-dash-admin-insert-absence',
//   templateUrl: './absence-create.component.html',
//   standalone: true,
//   styleUrls: ['./absence-create.component.css']
// })
// export class AbsenceCreateComponent implements OnInit{
//   FormAbsence!: FormGroup;
//   FormSearch!: FormGroup; // Corrected the typo
//   ListEleves!: Eleve[];
//   ListClasseGroup!: ClasseGroup[];
//
//   constructor(
//     private absenceService: AbsenceService,
//     private fb: FormBuilder,
//     private eleveService: EleveService,
//     private classeGroupService: classeGroupService
//   ) {}
//
//   ngOnInit(): void {
//     this.classeGroupService.getAllClasseGroup().subscribe((data) => {
//       this.ListClasseGroup = data;
//     });
//
//     this.eleveService.getAllEleves().subscribe((data) => {
//       this.ListEleves = data;
//     });
//
//     this.FormAbsence = this.fb.group({
//       date: ['', Validators.required],
//       time: ['', Validators.required],
//       motif: ['', Validators.required],
//       eleve_id: ['', Validators.required],
//       status: ['',Validators.required]
//     });
//
//     this.FormSearch = this.fb.group({
//       classeId: ['', Validators.required]
//     });
//   }
//
//   insertAbsence() {
//     if (this.FormAbsence.valid) {
//       const newAbsence: Absence = {
//         date: this.FormAbsence.value.date,
//         time: this.FormAbsence.value.time,
//         motif: this.FormAbsence.value.motif,
//         status: this.FormAbsence.value.status,
//         eleve: {
//           id: this.FormAbsence.value.eleve_id,
//           classeGroup: {
//             id: 0,
//             class_room_name: '',
//             school_name: '',
//             eleves: [],
//             professeurs: []
//           },
//           identificationId: '',
//           username: '',
//           age: 0,
//           gender: '',
//           email: '',
//           password: '',
//           roles: []
//         }
//       };
//
//       this.absenceService.insertAbsence(newAbsence).subscribe(msg => {
//         console.log(msg); // Add proper notification here
//       });
//       this.FormAbsence.reset(); // Reset after success
//     }
//   }
//
//   search() {
//     if (this.FormSearch.valid) {
//       const selectedClassId = this.FormSearch.value.classeId;
//       this.eleveService.getAllElevesByClasseGroupId(selectedClassId).subscribe((data) => {
//         this.ListEleves = data;
//       });
//     }
//   }
//
//   reloadAbsence() {
//     this.FormAbsence.reset();
//   }
//   reloadSearch() {
//     this.FormSearch.reset();
//   }
// }
