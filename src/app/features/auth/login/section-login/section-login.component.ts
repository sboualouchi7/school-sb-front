import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from "../../../../core/services/auth-service";
import { LoginRequest } from "../../../../core/dto/login-request";
import { Role } from "../../../../core/enums/Role";
import { NgIf } from "@angular/common";
import { JwtService } from "../../../../core/services/jwt.service";
import { JwtResponse } from "../../../../core/dto/jwt-response";

@Component({
  selector: 'app-section-login',
  templateUrl: './section-login.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['./section-login.component.css']
})
export class SectionLoginComponent {
  formLogin!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private jwtService: JwtService,
    private router: Router
  ) {
    this.formLogin = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.formLogin.valid) {
      const request: LoginRequest = this.formLogin.value;
      this.isLoading = true;
      this.authService.login(request).subscribe({
        next: (response: JwtResponse) => this.handleLoginSuccess(response),
        error: (err) => this.handleLoginError(err),
        complete: () => console.log('Login process complete.')
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs.';
    }
  }

  private handleLoginSuccess(response: JwtResponse) {
    console.log('Login successful:', response);

    const token = response?.token;
    if (!token) {
      console.error('No token found in the response.');
      this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      this.isLoading = false;
      return;
    }

    try {
      const role: string | null = this.jwtService.getUserRole(token);
      console.log('Extracted role:', role);

      if (role) {
        this.router.navigate(['/dashboard']);
      } else {
        console.error('No role found in the token.');
        this.errorMessage = 'Accès non autorisé.';
      }
    } catch (error) {
      console.error('Token processing failed:', error);
      this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
    }

    this.isLoading = false;
  }

  private handleLoginError(error: any) {
    console.error('Login failed:', error);
    this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
    this.isLoading = false;
  }
}
