// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ClasseNameDto } from 'src/app/Models/dto/ClasseNameDto';
// import { insertExamenDto } from 'src/app/Models/dto/InsertExamenDto';
// import { Professeur } from 'src/app/Models/professeur';
// import { classeGroupService } from 'src/app/Services/classe-group.service';
// import { ExamenService } from 'src/app/Services/examen.service';
// import { ProfService } from 'src/app/Services/prof.service';
//
// @Component({
//   selector: 'app-dash-admin-add-exams-to-prof',
//   templateUrl: './exam-assign-to-teacher.component.html',
//   standalone: true,
//   styleUrls: ['./exam-assign-to-teacher.component.css']
// })
// export class ExamAssignToTeacherComponent implements OnInit {
//   ListProfs!: Professeur[];
//   ListClasseRooms!: ClasseNameDto[];
//   FormExam!: FormGroup;
//
//   constructor(
//     private exService: ExamenService,
//     private profService: ProfService,
//     private fb: FormBuilder,
//     private classeService: classeGroupService
//   ) {}
//
//   ngOnInit(): void {
//     this.profService.getAllProfs().subscribe((data) => {
//       this.ListProfs = data;
//     });
//
//     this.FormExam = this.fb.group({
//       examenName: [{ value: '', disabled: true }, [Validators.required]],
//       examenDate: [{ value: '', disabled: true }, [Validators.required]],
//       classGroupId: [{ value: '', disabled: true }, [Validators.required]],
//       matter: [{ value: '', disabled: true }, [Validators.required]],
//       semester: [{ value: '', disabled: true }, [Validators.required]],
//       profId: ['', Validators.required],
//     });
//
//
//     this.FormExam.get('profId')?.valueChanges.subscribe((profId) => {
//       if (profId) {
//
//         this.enableFormControls();
//
//
//         this.classeService.getClassesNameOfProf(profId).subscribe((data) => {
//           this.ListClasseRooms = data;
//         });
//       } else {
//
//         this.disableFormControls();
//       }
//     });
//   }
//
//   enableFormControls() {
//     this.FormExam.get('examenName')?.enable();
//     this.FormExam.get('examenDate')?.enable();
//     this.FormExam.get('classGroupId')?.enable();
//     this.FormExam.get('matter')?.enable();
//     this.FormExam.get('semester')?.enable();
//   }
//
//   disableFormControls() {
//     this.FormExam.get('examenName')?.disable();
//     this.FormExam.get('examenDate')?.disable();
//     this.FormExam.get('classGroupId')?.disable();
//     this.FormExam.get('matter')?.disable();
//     this.FormExam.get('semester')?.disable();
//   }
//
//   insertExamen() {
//     if (this.FormExam.valid) {
//       const newExamen: insertExamenDto = this.FormExam.value;
//
//       this.exService.insertExamen(newExamen).subscribe(() => {
//         alert('Examen ajouté avec succès');
//       });
//
//
//       this.FormExam.reset();
//       this.disableFormControls();
//       this.reload();
//     }
//   }
//   reload(){
//     this.ngOnInit()
//   }
// }
