import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParentRequest } from '../dto/parent/parent-request';
import { ParentResponse } from '../dto/parent/parent-response';
import { environment } from '../../../environments/environment';
import {ApiResponse} from "../dto/common/api-response";

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  private apiUrl = `${environment.apiUrl}/parents`;

  constructor(private http: HttpClient) {}

  getAllParents(): Observable<ApiResponse<ParentResponse[]>> {
    return this.http.get<ApiResponse<ParentResponse[]>>(`${this.apiUrl}`);
  }

  getParentById(id: number): Observable<ApiResponse<ParentResponse>> {
    return this.http.get<ApiResponse<ParentResponse>>(`${this.apiUrl}/${id}`);
  }

  getParentsByEtudiantId(etudiantId: number): Observable<ApiResponse<ParentResponse[]>> {
    return this.http.get<ApiResponse<ParentResponse[]>>(`${this.apiUrl}/etudiant/${etudiantId}`);
  }

  createParent(request: ParentRequest): Observable<ApiResponse<ParentResponse>> {
    return this.http.post<ApiResponse<ParentResponse>>(`${this.apiUrl}`, request);
  }

  updateParent(id: number, request: ParentRequest): Observable<ApiResponse<ParentResponse>> {
    return this.http.put<ApiResponse<ParentResponse>>(`${this.apiUrl}/${id}`, request);
  }

  deleteParent(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
