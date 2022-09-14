import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ImportCSVFileInterface, ImportCSVFilesResponse } from '@models';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class DataImportService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'csv';
  }

  override getById(id: string | number): Observable<ImportCSVFileInterface> {
    return super.getById(id);
  }

  override get(url?: string | undefined, queryParams?: any): Observable<ImportCSVFilesResponse> {
    return super.get(url, queryParams);
  }

  override delete(id: string | number): Observable<any> {
    return super.delete(id);
  }

  import(data: { id: string | number; action: string }) {
    return this.post({ id: data.id, action: data.action }, `${data.id}/${data.action}`);
  }

  uploadFile(file: File, formId: string | number): Observable<any> {
    const apiUrl = this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('form_id', formId.toString());

    return this.httpClient.post(apiUrl, formData);
  }
}
