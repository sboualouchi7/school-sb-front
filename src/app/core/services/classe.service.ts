import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { Observable } from 'rxjs';
import { ClasseRequest } from '../dto/classe/classe-request';
import { ClasseResponse } from '../dto/classe/classe-response';
import { ApiResponse } from "../dto/common/api-response";

@Injectable({
  providedIn: 'root'
})
export class ClasseService {
  private apiUrl = `${environment.apiUrl}/classes`;

  constructor(private http: HttpClient) {}

  getAllClasses(): Observable<ApiResponse<ClasseResponse[]>> {
    return this.http.get<ApiResponse<ClasseResponse[]>>(`${this.apiUrl}`);
  }

  getClasseById(id: number): Observable<ApiResponse<ClasseResponse>> {
    return this.http.get<ApiResponse<ClasseResponse>>(`${this.apiUrl}/${id}`);
  }

  createClasse(request: ClasseRequest): Observable<ApiResponse<ClasseResponse>> {
    return this.http.post<ApiResponse<ClasseResponse>>(`${this.apiUrl}`, request);
  }

  updateClasse(id: number, request: ClasseRequest): Observable<ApiResponse<ClasseResponse>> {
    return this.http.put<ApiResponse<ClasseResponse>>(`${this.apiUrl}/${id}`, request);
  }

  deleteClasse(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
