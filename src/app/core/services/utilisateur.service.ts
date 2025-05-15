import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { Observable } from 'rxjs';
import { UtilisateurRequest } from '../dto/utilisateur/utilisateur-request';
import { UtilisateurResponse } from '../dto/utilisateur/utilisateur-response';
import { ApiResponse } from '../dto/common/api-response';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<UtilisateurResponse[]>> {
    return this.http.get<ApiResponse<UtilisateurResponse[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<UtilisateurResponse>> {
    return this.http.get<ApiResponse<UtilisateurResponse>>(`${this.apiUrl}/${id}`);
  }

  create(request: UtilisateurRequest): Observable<ApiResponse<UtilisateurResponse>> {
    return this.http.post<ApiResponse<UtilisateurResponse>>(this.apiUrl, request);
  }

  update(id: number, request: UtilisateurRequest): Observable<ApiResponse<UtilisateurResponse>> {
    return this.http.put<ApiResponse<UtilisateurResponse>>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getByRole(role: string): Observable<ApiResponse<UtilisateurResponse[]>> {
    return this.http.get<ApiResponse<UtilisateurResponse[]>>(`${this.apiUrl}/role/${role}`);
  }

  existsByUsername(username: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/exists/username/${username}`);
  }

  existsByEmail(email: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/exists/email/${email}`);
  }
}
