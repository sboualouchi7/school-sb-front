import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { Observable } from 'rxjs';
import { ModuleRequest } from '../dto/module/module-request';
import { ModuleResponse } from '../dto/module/module-response';
import { ClasseResponse } from '../dto/classe/classe-response';
import { SessionResponse } from '../dto/session/session-response';
import { ApiResponse } from '../dto/common/api-response';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private apiUrl = `${environment.apiUrl}/modules`;

  constructor(private http: HttpClient) {}

  getAllModules(): Observable<ApiResponse<ModuleResponse[]>> {
    return this.http.get<ApiResponse<ModuleResponse[]>>(`${this.apiUrl}`);
  }

  getModuleById(id: number): Observable<ApiResponse<ModuleResponse>> {
    return this.http.get<ApiResponse<ModuleResponse>>(`${this.apiUrl}/${id}`);
  }

  getModulesByClasse(classeId: number): Observable<ApiResponse<ModuleResponse[]>> {
    return this.http.get<ApiResponse<ModuleResponse[]>>(`${this.apiUrl}/classe/${classeId}`);
  }

  getModulesByEnseignant(enseignantId: number): Observable<ApiResponse<ModuleResponse[]>> {
    return this.http.get<ApiResponse<ModuleResponse[]>>(`${this.apiUrl}/enseignant/${enseignantId}`);
  }


  createModule(module: ModuleRequest): Observable<ApiResponse<ModuleResponse>> {
    return this.http.post<ApiResponse<ModuleResponse>>(`${this.apiUrl}`, module);
  }
  getMesModules(): Observable<ApiResponse<ModuleResponse[]>> {
    return this.http.get<ApiResponse<ModuleResponse[]>>(`${this.apiUrl}/mes-modules`);
  }
  getClassesByModule(moduleId: number): Observable<ApiResponse<ClasseResponse[]>> {
    return this.http.get<ApiResponse<ClasseResponse[]>>(`${this.apiUrl}/module/${moduleId}/classes`);
  }
  updateModule(id: number, module: ModuleRequest): Observable<ApiResponse<ModuleResponse>> {
    return this.http.put<ApiResponse<ModuleResponse>>(`${this.apiUrl}/${id}`, module);
  }

  deleteModule(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  activerModule(id: number, actif: boolean): Observable<ApiResponse<ModuleResponse>> {
    return this.http.patch<ApiResponse<ModuleResponse>>(`${this.apiUrl}/${id}/activation`, { actif });
  }

  getModulesBySessionAndEnseignant(sessionId: number, enseignantId: number): Observable<ApiResponse<ModuleResponse[]>> {
    return this.http.get<ApiResponse<ModuleResponse[]>>(`${this.apiUrl}/session/${sessionId}/enseignant/${enseignantId}`);
  }

  getClassesByModuleAndEnseignant(moduleId: number, enseignantId: number): Observable<ApiResponse<ClasseResponse[]>> {
    return this.http.get<ApiResponse<ClasseResponse[]>>(`${this.apiUrl}/${moduleId}/enseignant/${enseignantId}/classes`);
  }

  getSessionsByEnseignant(enseignantId: number): Observable<ApiResponse<SessionResponse[]>> {
    return this.http.get<ApiResponse<SessionResponse[]>>(`${this.apiUrl}/enseignant/${enseignantId}/sessions`);
  }
}
