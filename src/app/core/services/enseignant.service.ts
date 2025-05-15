import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { Observable } from 'rxjs';
import { EnseignantRequest } from '../dto/enseignant/enseignant-request';
import { EnseignantResponse } from '../dto/enseignant/enseignant-response';
import {ApiResponse} from "../dto/common/api-response";

@Injectable({
  providedIn: 'root'
})
export class EnseignantService {
  private apiUrl = `${environment.apiUrl}/enseignants`;

  constructor(private http: HttpClient) {}

  getAllEnseignants(): Observable<ApiResponse<EnseignantResponse[]>> {
    return this.http.get<ApiResponse<EnseignantResponse[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<EnseignantResponse>> {
    return this.http.get<ApiResponse<EnseignantResponse>>(`${this.apiUrl}/${id}`);
  }

  getByDepartement(departementId: number): Observable<ApiResponse<EnseignantResponse[]>> {
    return this.http.get<ApiResponse<EnseignantResponse[]>>(`${this.apiUrl}/departement/${departementId}`);
  }

  create(request: EnseignantRequest): Observable<ApiResponse<EnseignantResponse>> {
    return this.http.post<ApiResponse<EnseignantResponse>>(this.apiUrl, request);
  }

  update(id: number, request: EnseignantRequest): Observable<ApiResponse<EnseignantResponse>> {
    return this.http.put<ApiResponse<EnseignantResponse>>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
