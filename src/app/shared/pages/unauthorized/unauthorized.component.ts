// src/app/shared/pages/unauthorized/unauthorized.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <h1>Accès refusé</h1>
      <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      <button (click)="retourAccueil()" class="btn-retour">Retour à l'accueil</button>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      padding: 40px;
      text-align: center;
      max-width: 600px;
      margin: 50px auto;
      background: var(--primary-color);
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: var(--color-primary);
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 30px;
      color: var(--text-color);
    }
    .btn-retour {
      background: var(--color-primary);
      color: var(--text-color);
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-retour:hover {
      opacity: 0.9;
    }
  `]
})
export class UnauthorizedComponent {
  retourAccueil() {
    window.location.href = '/';
  }
}
