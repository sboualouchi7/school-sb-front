import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentRequest } from '../dto/document/document-request';
import { DocumentResponse } from '../dto/document/document-response';
import { StatusDocument } from '../enums/StatusDocument';
import {ApiResponse} from "../dto/common/api-response";

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getAllDocuments(): Observable<ApiResponse<DocumentResponse[]>> {
    return this.http.get<ApiResponse<DocumentResponse[]>>(`${this.apiUrl}`);
  }

  getDocumentById(id: number): Observable<ApiResponse<DocumentResponse>> {
    return this.http.get<ApiResponse<DocumentResponse>>(`${this.apiUrl}/${id}`);
  }

  getDocumentsByEtudiant(etudiantId: number): Observable<ApiResponse<DocumentResponse[]>> {
    return this.http.get<ApiResponse<DocumentResponse[]>>(`${this.apiUrl}/etudiant/${etudiantId}`);
  }

  getDocumentsByDemandeur(demandeurId: number): Observable<ApiResponse<DocumentResponse[]>> {
    return this.http.get<ApiResponse<DocumentResponse[]>>(`${this.apiUrl}/demandeur/${demandeurId}`);
  }

  getDocumentsByType(type: string): Observable<ApiResponse<DocumentResponse[]>> {
    return this.http.get<ApiResponse<DocumentResponse[]>>(`${this.apiUrl}/type/${type}`);
  }

  getDocumentsByStatus(status: StatusDocument): Observable<ApiResponse<DocumentResponse[]>> {
    return this.http.get<ApiResponse<DocumentResponse[]>>(`${this.apiUrl}/status/${status}`);
  }

  createDocument(request: DocumentRequest): Observable<ApiResponse<DocumentResponse>> {
    return this.http.post<ApiResponse<DocumentResponse>>(`${this.apiUrl}`, request);
  }

  updateDocument(id: number, request: DocumentRequest): Observable<ApiResponse<DocumentResponse>> {
    return this.http.put<ApiResponse<DocumentResponse>>(`${this.apiUrl}/${id}`, request);
  }

  updateStatus(id: number, status: StatusDocument): Observable<ApiResponse<DocumentResponse>> {
    return this.http.patch<ApiResponse<DocumentResponse>>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateFichierUrl(id: number, fichierUrl: string): Observable<ApiResponse<DocumentResponse>> {
    return this.http.patch<ApiResponse<DocumentResponse>>(`${this.apiUrl}/${id}/fichier-url`, { fichierUrl });
  }

  deleteDocument(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
