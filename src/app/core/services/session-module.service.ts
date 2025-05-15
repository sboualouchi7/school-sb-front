import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionModuleRequest } from '../dto/sessionmodule/session-module-request';
import { SessionModuleResponse } from '../dto/sessionmodule/session-module-response';
import {ApiResponse} from "../dto/common/api-response";

@Injectable({ providedIn: 'root' })
export class SessionModuleService {
  private apiUrl = `${environment.apiUrl}/session-modules`;

  constructor(private http: HttpClient) {}

  getAllSessionModules(): Observable<ApiResponse<SessionModuleResponse[]>> {
    return this.http.get<ApiResponse<SessionModuleResponse[]>>(`${this.apiUrl}`);
  }

  getSessionModuleById(id: number): Observable<ApiResponse<SessionModuleResponse>> {
    return this.http.get<ApiResponse<SessionModuleResponse>>(`${this.apiUrl}/${id}`);
  }

  getSessionModulesBySession(sessionId: number): Observable<ApiResponse<SessionModuleResponse[]>> {
    return this.http.get<ApiResponse<SessionModuleResponse[]>>(`${this.apiUrl}/session/${sessionId}`);
  }

  getSessionModulesByModule(moduleId: number): Observable<ApiResponse<SessionModuleResponse[]>> {
    return this.http.get<ApiResponse<SessionModuleResponse[]>>(`${this.apiUrl}/module/${moduleId}`);
  }

  getSessionModulesBySessionOrdered(sessionId: number): Observable<ApiResponse<SessionModuleResponse[]>> {
    return this.http.get<ApiResponse<SessionModuleResponse[]>>(`${this.apiUrl}/session/${sessionId}/ordered`);
  }

  createSessionModule(request: SessionModuleRequest): Observable<ApiResponse<SessionModuleResponse>> {
    return this.http.post<ApiResponse<SessionModuleResponse>>(`${this.apiUrl}`, request);
  }

  updateSessionModule(id: number, request: SessionModuleRequest): Observable<ApiResponse<SessionModuleResponse>> {
    return this.http.put<ApiResponse<SessionModuleResponse>>(`${this.apiUrl}/${id}`, request);
  }
}
