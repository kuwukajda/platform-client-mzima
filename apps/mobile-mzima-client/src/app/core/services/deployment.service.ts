import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { getRandomColor } from '@helpers';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class DeploymentService {
  constructor(private httpClient: HttpClient, private storageService: StorageService) {}

  getApiVersions(): string {
    return '';
  }

  getResourceUrl(): string {
    return '';
  }

  public searchDeployments(search: string): Observable<any> {
    const storeDeployments = this.storageService.getStorage('deployments', 'array') || '[]';

    const params = new HttpParams().set('q', search);
    const url = 'https://api.ushahidi.io/deployments';
    return this.httpClient.get<any[]>(url, { params }).pipe(
      map((deployments: any) =>
        deployments
          .filter((deployment: any) => deployment.status === 'deployed')
          .map((deployment: any) => {
            const isSelected = !!storeDeployments.find((item: any) => item.id === deployment.id);
            return {
              ...deployment,
              image:
                deployment.image ||
                (deployment.deployment_name
                  ? `https://via.placeholder.com/150/${getRandomColor()}/FFFFFF?text=${deployment.deployment_name
                      .charAt(0)
                      .toUpperCase()}`
                  : 'default_image_url'),
              selected: isSelected,
            };
          }),
      ),
    );
  }
}
