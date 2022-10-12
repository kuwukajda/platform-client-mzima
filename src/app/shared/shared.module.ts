import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GtmDirective } from '../core/directives/gtm.directive';

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
  DonationButtonComponent,
  MapWithMarkerComponent,
  CollectionsModalComponent,
  SnackbarComponent,
  SearchFormComponent,
  SaveSearchModalComponent,
  LocationSelectionComponent,
  AccountSettingsComponent,
} from './components';
import { MaterialModule } from './material.module';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { TranslateModule } from '@ngx-translate/core';
import { DateAgoPipe, FilterValuePipe } from '@pipes';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

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
  DonationButtonComponent,
  DateAgoPipe,
  MapWithMarkerComponent,
  CollectionsModalComponent,
  SnackbarComponent,
  SearchFormComponent,
  SaveSearchModalComponent,
  FilterValuePipe,
  LocationSelectionComponent,
  GtmDirective,
  AccountSettingsComponent,
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
];

@NgModule({
  declarations: [...components],
  imports: [...modules],
  exports: [...components, ...modules],
})
export class SharedModule {}
