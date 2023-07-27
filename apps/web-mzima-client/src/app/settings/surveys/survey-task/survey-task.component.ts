import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CONST } from '@constants';
import { LanguageInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import {
  GroupCheckboxItemInterface,
  GroupCheckboxValueInterface,
} from '../../../shared/components';
import { CreateFieldModalComponent } from '../create-field-modal/create-field-modal.component';
import {
  FormsService,
  FormAttributeInterface,
  RoleResult,
  SurveyItem,
  SurveyItemTask,
} from '@mzima-client/sdk';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';
import { LanguageService } from '../../../core/services/language.service';
import _ from 'lodash';

@Component({
  selector: 'app-survey-task',
  templateUrl: './survey-task.component.html',
  styleUrls: ['./survey-task.component.scss'],
})
export class SurveyTaskComponent implements OnInit, OnChanges {
  @Input() task: SurveyItemTask;
  @Input() survey: SurveyItem;
  @Input() isDefaultLanguageSelected: boolean;
  @Input() selectLanguageCode: string;
  @Input() roles: RoleResult[];
  @Input() isMain: boolean;
  @Output() colorSelected = new EventEmitter();
  @Output() languageChange = new EventEmitter();
  @Output() duplicateTaskChange = new EventEmitter();
  @Output() deleteTaskChange = new EventEmitter();
  @Output() errorFieldChange = new EventEmitter();

  surveyId: string;
  selectedRoles: GroupCheckboxValueInterface = {
    value: 'everyone',
    options: [],
  };

  taskFields: FormAttributeInterface[];
  isPost = false;
  showLangError = false;
  selectedLanguage: any;
  languages: any;
  languagesToSelect: LanguageInterface[] = [];
  roleOptions: GroupCheckboxItemInterface[] = [];
  selectedColor: string;
  currentInterimId = 0;

  constructor(
    private confirm: ConfirmModalService,
    private formsService: FormsService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private languageService: LanguageService,
    private translate: TranslateService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roles']) {
      this.roleOptions = [
        {
          name: this.translate.instant('role.everyone'),
          value: 'everyone',
          icon: 'person',
        },
        {
          name: this.translate.instant('app.specific_roles'),
          value: 'specific',
          icon: 'group',
          options: this.roles.map((role) => {
            return {
              name: role.display_name,
              value: role.name,
              checked: role.name === 'admin',
              disabled: role.name === 'admin',
            };
          }),
        },
      ];
    }

    if (changes['survey']) {
      this.initLanguages();
      this.selectedColor = this.survey.color;
    }
  }

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('id') || '';
    this.taskFields = this.task.fields;
    this.currentInterimId = this.findIntermId();
    this.isPost = this.task.type === 'post';
    if (this.surveyId && this.isPost) {
      this.getSurveyRoles();
    }
  }

  private getSurveyRoles() {
    this.formsService.getRoles(this.surveyId).subscribe((response) => {
      this.selectedRoles = {
        value: this.survey.everyone_can_create ? 'everyone' : 'specific',
        options: response.map((r) => {
          return this.roles.find((role) => role.id === r.role_id)!.name;
        }),
      };
    });
  }

  getConfigOptions() {
    return {
      selectedRoles: this.selectedRoles,
      hide_time: this.survey.hide_time,
      hide_location: this.survey.hide_location,
      hide_author: this.survey.hide_author,
      require_approval: this.survey.require_approval,
      color: this.selectedColor,
    };
  }

  private findIntermId() {
    const stageIds: number[] = [];
    _.each(this.taskFields, (field: any) => {
      if (field.form_stage_id && typeof field.form_stage_id !== 'number') {
        stageIds.push(field.form_stage_id.split('_')[2]);
      }
    });
    return stageIds.length ? Math.max.apply(null, stageIds) : 0;
  }

  private initLanguages() {
    this.languagesToSelect = this.languageService.getLanguages();

    const language = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}language`);

    if (!this.survey.enabled_languages) {
      this.survey.enabled_languages = {
        default: language!,
        available: [],
      };
    }
    this.languages = {
      default: this.survey.enabled_languages.default,
      active: this.survey.enabled_languages.default,
      available: this.survey.enabled_languages.available,
      surveyLanguages: [
        this.survey.enabled_languages.default,
        ...this.survey.enabled_languages.available,
      ],
    };
    this.selectedLanguage = this.survey.enabled_languages.default;
  }

  drop(event: CdkDragDrop<FormAttributeInterface[]>) {
    moveItemInArray(this.taskFields, event.previousIndex, event.currentIndex);
  }

  changeLanguage(event: any) {
    const newLang = event.value;
    this.languageChange.emit(newLang);
    if (this.survey.enabled_languages.available.some((l) => l === newLang)) {
      this.showLangError = true;
    } else {
      this.showLangError = false;
      this.languages = {
        default: newLang,
        active: newLang,
        available: this.survey.enabled_languages.available,
      };
      this.selectedLanguage = newLang;
      this.survey.enabled_languages.default = newLang;
    }
  }

  async deleteField(index: number) {
    const confirmed = await this.confirm.open({
      title: this.translate.instant('notify.form.delete_attribute_confirm'),
      description: `<p>${this.translate.instant('notify.form.delete_attribute_confirm_desc')}</p>`,
    });
    if (!confirmed) return;

    this.taskFields.splice(index, 1);
  }

  get anonymiseReportersEnabled() {
    return true;
  }

  addField() {
    const dialogRef = this.dialog.open(CreateFieldModalComponent, {
      width: '100%',
      maxWidth: 576,
      minWidth: 300,
      panelClass: 'modal',
      data: {
        surveyId: this.surveyId,
        isTranslateMode: !this.isDefaultLanguageSelected,
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        if (response) {
          this.taskFields.push(response);
        }
      },
    });
  }

  canDelete(field: FormAttributeInterface) {
    return (
      this.isDefaultLanguageSelected &&
      (this.isPost ? field.type !== 'title' && field.type !== 'description' : true)
    );
  }

  editField(selectedFieldType: any, idx: number) {
    const dialogRef = this.dialog.open(CreateFieldModalComponent, {
      width: '100%',
      maxWidth: 576,
      minWidth: 300,
      panelClass: 'modal',
      data: {
        selectedFieldType: _.cloneDeep(selectedFieldType),
        surveyId: this.surveyId,
        isTranslateMode: !this.isDefaultLanguageSelected,
        selectLanguageCode: this.selectLanguageCode,
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (response: FormAttributeInterface) => {
        if (response) {
          this.taskFields[idx] = response;
        }
      },
    });
  }

  public colorChanged(): void {
    this.colorSelected.emit(this.selectedColor);
  }

  public deleteTask(task: SurveyItemTask) {
    this.deleteTaskChange.emit(task);
    this.errorFieldChange.emit(false);
  }

  public duplicateTask(task: SurveyItemTask) {
    const dup = _.cloneDeep(task);
    dup.label = '';
    dup.description = '';
    _.each(dup.fields, (field: Partial<any>) => {
      if (field) {
        delete field['id'];
        delete field['url'];
        delete field['key'];
        field['form_stage_id'] = this.getInterimId();
      }
    });
    this.duplicateTaskChange.emit(dup);
  }

  private getInterimId() {
    const id = 'interim_id_' + this.currentInterimId;
    this.currentInterimId++;
    return id;
  }

  public changeLabel(value: string) {
    this.errorFieldChange.emit(value.trim().length === 0);
  }
}
