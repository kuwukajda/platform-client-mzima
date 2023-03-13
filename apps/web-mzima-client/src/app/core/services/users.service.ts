import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { EnvService } from './env.service';
import { GeoJsonFilter, UserInterface, UserInterfaceResponse, UserResponse } from '@models';
import { ResourceService } from './resource.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends ResourceService<any> {
  private totalUsers = new Subject<number>();
  public totalUsers$ = this.totalUsers.asObservable();

  constructor(
    protected override httpClient: HttpClient, //
    protected override env: EnvService,
    private sessionService: SessionService,
  ) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v5;
  }

  getResourceUrl(): string {
    return 'users';
  }

  getCurrentUser(): Observable<UserInterfaceResponse> {
    return super.get('me').pipe(
      tap((response) => {
        const { data } = response;
        this.sessionService.setCurrentUser({
          userId: data.id,
          realname: data.realname,
          email: data.email,
          role: data.role,
          permissions: data.permissions,
          allowed_privileges: data.allowed_privileges,
          gravatar: data.gravatar,
          language: data.language,
        });
      }),
    );
  }

  public dispatchUserEvents(userData: any): void {
    // FIXME?! window.dispatchEvent
    window.dispatchEvent(new CustomEvent('ush:analytics:refreshUserProperties'));
    window.dispatchEvent(
      new CustomEvent('datalayer:custom-event', {
        detail: {
          event: 'user logged in',
          event_type: 'user_interaction',
          user_role: userData.role === 'admin' ? 'admin' : 'member',
        },
      }),
    );
  }

  updateCurrentUser(data: any): Observable<UserInterface> {
    return super.update('me', data);
  }

  public getUsers(url: string, filter?: GeoJsonFilter): Observable<UserResponse> {
    return super.get(url, filter).pipe(
      tap((response) => {
        this.totalUsers.next(response.meta.total);
      }),
    );
  }

  public getUserSettings(id: string) {
    const url = `${id}/settings`;
    return super.get(url);
  }

  public updateUserSettings(id: string, params: any, settingsId?: number) {
    const config = settingsId ? `settings/${settingsId}` : 'settings';
    return super.update(id, params, config);
  }

  public getUserById(id: string) {
    return super.get(id);
  }

  public updateUserById(id: number, params: any) {
    return super.update(id, params);
  }

  public createUser(data: any) {
    return super.post(data);
  }

  public deleteUser(id: number) {
    return super.delete(id);
  }
}
