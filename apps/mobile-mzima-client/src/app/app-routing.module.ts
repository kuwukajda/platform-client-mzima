import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NotAuthorizedGuard } from '@guards';
import { PageNotFoundComponent } from './shared/components';

const routes: Routes = [
  {
    path: '',
    // redirectTo: '/auth/login',
    loadChildren: () => import('./tabs/tabs.module').then((m) => m.TabsPageModule),
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthPageModule),
    canActivate: [NotAuthorizedGuard],
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then((m) => m.MapPageModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthPageModule),
  },
  {
    path: 'walkthrough',
    loadChildren: () =>
      import('./walkthrough/walkthrough.module').then((m) => m.WalkthroughPageModule),
  },
  {
    path: 'deployment',
    loadChildren: () =>
      import('./deployment/deployment.module').then((m) => m.DeploymentPageModule),
  },
  {
    path: 'deployment-search',
    loadChildren: () =>
      import('./deployment/deployment-search/deployment-search.module').then(
        (m) => m.DeploymentSearchPageModule,
      ),
  },
  {
    path: '**',
    pathMatch: 'full',
    component: PageNotFoundComponent,
    data: {
      breadcrumb: 'app.page-not-found',
      ogTitle: 'app.page-not-found',
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
