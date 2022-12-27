import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GtmDirective, DataQaInputDirective, DataQaDirective } from '@directives';
import { LottieComponent } from 'ngx-lottie';
import { ShareModule } from 'ngx-sharebuttons';

import {
  SidebarComponent,
  ToolbarComponent,
  LogoComponent,
  BreadcrumbComponent,
  SubmitPostButtonComponent,
  SelectLanguagesModalComponent,
  SpinnerComponent,
  ConfirmModalComponent,
  LanguageComponent,
  MapWithMarkerComponent,
  CollectionsModalComponent,
  SnackbarComponent,
  SearchFormComponent,
  SaveSearchModalComponent,
  LocationSelectionComponent,
  AccountSettingsComponent,
  MultilevelSelectComponent,
  GroupCheckboxSelectComponent,
  ColorPickerComponent,
  CompanyInfoComponent,
  FilterControlComponent,
  DonationButtonComponent,
  SettingsHeaderComponent,
  CollectionItemComponent,
} from './components';
import { MaterialModule } from './material/material.module';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { TranslateModule } from '@ngx-translate/core';
import { DateAgoPipe, FilterValuePipe } from '@pipes';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ColorPickerModule } from 'ngx-color-picker';
import { LottieAnimationComponent } from './components/lottie-animation/lottie-animation.component';
import { PasswordStrengthComponent } from './components/password-strength/password-strength.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { CookiesNotificationComponent } from './components/cookies-notification/cookies-notification.component';
import { ShareModalComponent } from './components/share-modal/share-modal.component';

const directives = [
  GtmDirective, //
  DataQaInputDirective,
  DataQaDirective,
];

const components = [
  SidebarComponent,
  ToolbarComponent,
  LogoComponent,
  BreadcrumbComponent,
  SubmitPostButtonComponent,
  LanguageComponent,
  SpinnerComponent,
  ConfirmModalComponent,
  SelectLanguagesModalComponent,
  DateAgoPipe,
  MapWithMarkerComponent,
  CollectionsModalComponent,
  SnackbarComponent,
  SearchFormComponent,
  SaveSearchModalComponent,
  FilterValuePipe,
  LocationSelectionComponent,
  AccountSettingsComponent,
  MultilevelSelectComponent,
  GroupCheckboxSelectComponent,
  ColorPickerComponent,
  CompanyInfoComponent,
  FilterControlComponent,
  DonationButtonComponent,
  LottieAnimationComponent,
  SettingsHeaderComponent,
  PasswordStrengthComponent,
  CollectionItemComponent,
  PageNotFoundComponent,
  CookiesNotificationComponent,
  ShareModalComponent,
];

const modules = [
  CommonModule,
  MaterialModule,
  ReactiveFormsModule,
  FormsModule,
  RouterModule,
  NgxMatTimepickerModule,
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  FormsModule,
  TranslateModule,
  LeafletModule,
  ColorPickerModule,
  ShareModule,
];

@NgModule({
  declarations: [...components, ...directives],
  imports: [...modules, LottieComponent],
  exports: [...components, ...directives, ...modules],
})
export class SharedModule {}
