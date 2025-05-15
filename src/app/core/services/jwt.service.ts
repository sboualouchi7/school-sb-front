import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Role } from "../enums/Role";

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserRole(token: string): string | null {
    try {
      const decodedToken = this.decodeToken(token);
      if (decodedToken?.roles && decodedToken.roles.length > 0) {
        const role = decodedToken.roles[0];
        return role.startsWith('ROLE_') ? role.substring(5) : role;
      }
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  saveToken(token: string): void {
    try {
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage successfully');
      // Double vérification
      const storedToken = localStorage.getItem('token');
      if (storedToken !== token) {
        console.warn('Token not properly saved to localStorage');
      }
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  }

  setUserRole(role: string): void {
    try {
      localStorage.setItem('userRole', role);
      console.log('Role saved to localStorage:', role);
    } catch (error) {
      console.error('Error saving role to localStorage:', error);
    }
  }

  getUserRoleFromStorage(): string | null {
    try {
      return localStorage.getItem('userRole');
    } catch (error) {
      console.error('Error getting role from localStorage:', error);
      return null;
    }
  }

  getUsernameFromToken(token: string): string | null {
    try {
      const decodedToken = this.decodeToken(token);
      return decodedToken?.sub || null;
    } catch (error) {
      console.error('Error getting username from token:', error);
      return null;
    }
  }

  removeToken(): void {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      console.log('Token and role removed from localStorage');
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  }

  getToken(): string | null {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
      }
      return token;
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const decodedToken: any = this.decodeToken(token);
      return decodedToken.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  isAdmin(): boolean {
    const role = this.getUserRoleFromStorage();
    return role === Role.ADMIN;
  }

  isEnseignant(): boolean {
    const role = this.getUserRoleFromStorage();
    return role === Role.ENSEIGNANT;
  }

  isEtudiant(): boolean {
    const role = this.getUserRoleFromStorage();
    return role === Role.ETUDIANT;
  }

  isParent(): boolean {
    const role = this.getUserRoleFromStorage();
    return role === Role.PARENT;
  }
}
