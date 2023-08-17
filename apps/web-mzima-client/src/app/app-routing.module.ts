import { NgModule } from '@angular/core';
import { RouterModule, Routes, TitleStrategy } from '@angular/router';
import { HostGuard, AccessDeniedGuard, ResetTokenGuard, AccessAllowGuard } from '@guards';
import { PageNotFoundComponent } from './shared/components';
import { UshahidiPageTitleStrategy } from '@services';
import { AccessDeniedComponent } from './shared/components/access-denied/access-denied.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full',
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then((m) => m.MapModule),
    canActivate: [AccessDeniedGuard],
    data: {
      breadcrumb: 'nav.map',
      ogTitle: 'nav.map',
    },
  },
  {
    path: 'data',
    loadChildren: () => import('./data/data.module').then((m) => m.DataModule),
    canActivate: [AccessDeniedGuard],
    data: {
      breadcrumb: 'nav.data',
      ogTitle: 'nav.data',
    },
  },
  {
    path: 'feed',
    loadChildren: () => import('./feed/feed.module').then((m) => m.FeedModule),
    canActivate: [AccessDeniedGuard],
    data: {
      breadcrumb: 'nav.feed',
      ogTitle: 'nav.feed',
    },
  },
  {
    path: 'activity',
    loadChildren: () => import('./activity/activity.module').then((m) => m.ActivityModule),
    canActivate: [AccessDeniedGuard],
    data: {
      breadcrumb: 'nav.activity',
      ogTitle: 'nav.activity',
    },
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule),
    canActivate: [HostGuard, AccessDeniedGuard],
    data: {
      breadcrumb: 'nav.settings',
      ogTitle: 'nav.settings',
    },
  },
  {
    path: 'post',
    loadChildren: () => import('./post/post.module').then((m) => m.PostModule),
    canActivate: [AccessDeniedGuard],
    data: {
      breadcrumb: 'nav.posts',
      ogTitle: 'nav.posts',
    },
  },
  {
    path: 'posts', // For support legacy URL routes
    loadChildren: () => import('./post/post.module').then((m) => m.PostModule),
    canActivate: [AccessDeniedGuard],
    data: {
      breadcrumb: 'nav.posts',
      ogTitle: 'nav.posts',
    },
  },
  {
    path: 'reset',
    title: 'reset',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
    data: {
      breadcrumb: 'nav.resetpassword',
      ogTitle: 'nav.resetpassword',
    },
  },
  {
    path: 'forgotpassword/confirm/:token',
    canActivate: [ResetTokenGuard],
    component: PageNotFoundComponent,
  },
  {
    path: 'forbidden',
    component: AccessDeniedComponent,
    canActivate: [AccessAllowGuard],
    data: {
      breadcrumb: 'nav.forbidden',
      ogTitle: 'nav.forbidden',
    },
  },
  {
    path: 'views',
    children: [
      {
        path: 'map',
        redirectTo: '/map',
      },
      {
        path: 'data',
        redirectTo: '/feed',
      },
    ],
  },
  {
    path: 'not-found',
    component: PageNotFoundComponent,
    data: {
      breadcrumb: 'app.page-not-found',
      ogTitle: 'app.page-not-found',
    },
  },
  {
    path: '**',
    pathMatch: 'full',
    canActivate: [AccessDeniedGuard],
    component: PageNotFoundComponent,
    data: {
      breadcrumb: 'app.page-not-found',
      ogTitle: 'app.page-not-found',
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: TitleStrategy, useClass: UshahidiPageTitleStrategy }],
})
export class AppRoutingModule {}
