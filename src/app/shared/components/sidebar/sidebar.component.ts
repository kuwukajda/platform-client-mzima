import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SessionService, AuthService, GtmTrackingService } from '@services';
import { LoginComponent, RegisterComponent } from '@auth';
import { MenuInterface, UserMenuInterface } from '@models';
import { CollectionsComponent } from '@data';
import { takeUntilDestroy$ } from '@helpers';
import { EnumGtmEvent, EnumGtmSource } from '@enums';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  public menu: MenuInterface[] = [];
  public userMenu: UserMenuInterface[] = [];
  userData$ = this.sessionService.currentUserData$.pipe(takeUntilDestroy$());
  public siteConfig = this.sessionService.getSiteConfigurations();
  public canRegister = false;

  constructor(
    private dialog: MatDialog,
    private sessionService: SessionService,
    private authService: AuthService,
    private gtmTracking: GtmTrackingService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.userData$.subscribe((userData) => {
      this.isLoggedIn = !!userData.userId;
      this.isAdmin = userData.role === 'admin';
      this.initMenu();
    });

    this.canRegister = !this.siteConfig.private && !this.siteConfig.disable_registration;
  }

  private initMenu() {
    this.menu = [
      { label: 'Map view', router: 'map', icon: 'marker', visible: true },
      { label: 'Data view', router: 'feed', icon: 'data', visible: true },
      { label: 'Activity', router: 'activity', icon: 'activity', visible: true },
      { label: 'Settings', router: 'settings', icon: 'settings', visible: this.isAdmin },
    ];
    this.userMenu = [
      {
        label: 'Collections',
        icon: 'collections',
        visible: true,
        action: () => this.openCollections(),
      },
      { label: 'Log in', icon: 'login', visible: !this.isLoggedIn, action: () => this.openLogin() },
      {
        label: 'Sign up',
        icon: 'signup',
        visible: !this.isLoggedIn && this.canRegister,
        action: () => this.openSignup(),
      },
      { label: 'Log out', icon: 'logout', visible: this.isLoggedIn, action: () => this.logout() },
    ];
  }

  private openLogin(): void {
    this.dialog.open(LoginComponent, {
      width: '100%',
      maxWidth: 480,
    });
  }

  private openSignup(): void {
    const dialogRef = this.dialog.open(RegisterComponent, {
      width: '100%',
      maxWidth: 480,
    });

    dialogRef.afterClosed().subscribe((isSuccess) => {
      if (isSuccess) {
        this.openLogin();
      }
    });
  }

  private openCollections(): void {
    const dialogRef = this.dialog.open(CollectionsComponent, {
      width: '560px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        response ? console.log(response) : null;
      },
    });
  }

  private logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  registerPage(event: MouseEvent, router: string, label: string) {
    event.preventDefault();
    this.gtmTracking.registerEvent(
      {
        event: EnumGtmEvent.PageView,
        // @ts-ignore
        source: EnumGtmSource[label],
      },
      GtmTrackingService.MapPath(`/${router}`),
    );
  }
}
