import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from "../../../environments/environment";
import { JwtService } from "./jwt.service";
import { Router } from "@angular/router";
import { Role } from "../enums/Role";
import { LoginRequest } from "../dto/login-request";
import { JwtResponse } from "../dto/jwt-response";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  currentUserSubject = new BehaviorSubject<any>(this.decodeToken(this.jwtService.getToken()));
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private jwtService: JwtService,
    private router: Router
  ) {
    // Vérifier si un token existe au démarrage et mettre à jour le subject
    const token = this.jwtService.getToken();
    if (token) {
      this.currentUserSubject.next(this.decodeToken(token));
    }
  }

  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response: JwtResponse) => {
        if (response && response.token) {
          console.log("Token reçu, sauvegarde en cours...");
          // Enregistrer le token dans localStorage
          this.jwtService.saveToken(response.token);

          // Décoder le token et mettre à jour le subject
          const decodedToken = this.decodeToken(response.token);
          this.currentUserSubject.next(decodedToken);

          // Récupérer et stocker le rôle si présent
          if (decodedToken && decodedToken.roles && decodedToken.roles.length > 0) {
            const role = decodedToken.roles[0];
            const normalizedRole = role.startsWith('ROLE_') ? role.substring(5) : role;
            this.jwtService.setUserRole(normalizedRole);
            console.log("Rôle sauvegardé:", normalizedRole);
          }

          // Vérifier que le token a bien été enregistré
          const storedToken = this.jwtService.getToken();
          console.log("Token stocké dans localStorage:", storedToken ? "Oui" : "Non");
        } else {
          console.error('No token in login response');
        }
      })
    );
  }

  verifyToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify`);
  }

  checkUsernameExists(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/utilisateur/${username}/exists`);
  }

  checkEmailExists(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/email/${email}/exists`);
  }

  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`);
  }

  logout(): void {
    this.jwtService.removeToken();
    this.currentUserSubject.next(null);
    this.router.navigate(['']);
  }

  isLoggedIn(): boolean {
    const token = this.jwtService.getToken();
    if (!token) {
      return false;
    }

    try {
      // Vérifier si le token est expiré
      const decoded = this.jwtService.decodeToken(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      this.logout();
      return false;
    }
  }

  hasRole(role: Role): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser || !currentUser.roles) {
      return false;
    }

    return currentUser.roles.some((userRole: string) => {
      const normalizedUserRole = userRole.startsWith('ROLE_') ? userRole.substring(5) : userRole;
      const normalizedRole = typeof role === 'string' && role.startsWith('ROLE_') ? role.substring(5) : role;

      return normalizedUserRole === normalizedRole;
    });
  }

  getCurrentUserRole(): Role | null {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser || !currentUser.roles || currentUser.roles.length === 0) {
      return null;
    }

    const role = currentUser.roles[0];
    return role.startsWith('ROLE_') ? role.substring(5) as Role : role as Role;
  }

  // Fonction utilitaire pour normaliser les rôles (enlever le préfixe ROLE_)
  normalizeRole(role: string): string {
    return role.startsWith('ROLE_') ? role.substring(5) : role;
  }

  private decodeToken(token: string | null): any {
    if (token) {
      return this.jwtService.decodeToken(token);
    }
    return null;
  }
}
