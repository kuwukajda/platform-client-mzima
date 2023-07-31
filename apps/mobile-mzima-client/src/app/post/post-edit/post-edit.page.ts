import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { STORAGE_KEYS } from '@constants';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY, from, lastValueFrom, map, Observable, of, switchMap, tap } from 'rxjs';
import {
  GeoJsonFilter,
  MediaService,
  PostContent,
  postHelpers,
  PostResult,
  PostsService,
  SurveysService,
} from '@mzima-client/sdk';
import {
  AlertService,
  DatabaseService,
  NetworkService,
  SessionService,
  ToastService,
} from '@services';
import { FormValidator, preparingVideoUrl } from '@validators';
import { PostEditForm, prepareRelationConfig, UploadFileHelper } from '../helpers';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { objectHelpers, dateHelper } from '@helpers';

dayjs.extend(timezone);

@UntilDestroy()
@Component({
  selector: 'app-post-edit',
  templateUrl: 'post-edit.page.html',
  styleUrls: ['post-edit.page.scss'],
})
export class PostEditPage {
  @Input() public postInput: any;
  @Output() cancel = new EventEmitter();
  @Output() updated = new EventEmitter();
  public date: string;
  public color: string;
  public form: FormGroup;
  public taskForm: FormGroup;
  private initialFormData: any;
  private relationConfigForm: any;
  private relationConfigSource: any;
  private relationConfigKey: string;
  private isSearching = false;
  public relatedPosts: PostResult[];
  public relationSearch: string;
  public selectedRelatedPost: any;
  private fieldsFormArray = ['tags'];
  public description: string;
  public title: string;
  public postId: number;
  private post: any;
  public tasks: any[] = [];
  private completeStages: number[] = [];
  public surveyName: string;
  public atLeastOneFieldHasValidationError: boolean;
  public locationRequired = false;
  public emptyLocation = false;
  public formValidator = new FormValidator();

  public filters: any;
  public surveyList: any[] = [];
  public surveyListOptions: any;
  public selectedSurveyId: number | null;
  public selectedSurvey: any;
  private fileToUpload: any;
  private checkedList: any[] = [];
  public isConnection = true;
  public connectionInfo = '';
  private queryParams: Params;

  dateOption: any;

  constructor(
    private networkService: NetworkService,
    private toastService: ToastService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private postsService: PostsService,
    private mediaService: MediaService,
    private surveysService: SurveysService,
    private sessionService: SessionService,
    private dataBaseService: DatabaseService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {
    this.route.queryParams.subscribe({
      next: (queryParams) => {
        this.queryParams = queryParams;
      },
    });
  }

  async ionViewWillEnter() {
    this.initNetworkListener();
    await this.checkNetwork();

    this.filters = this.getFilters();
    this.post = await this.checkPost();
    this.surveyList = await this.getSurveys();

    if (this.post) {
      this.selectedSurveyId = this.post.form_id!;
      this.loadForm(this.post.post_content);
    }

    this.transformSurveys();
  }

  private async checkNetwork() {
    this.setConnectionStatus(await this.networkService.checkNetworkStatus());
  }

  async checkPost(): Promise<any> {
    return new Promise<number>((resolve, reject) => {
      this.route.paramMap
        .pipe(
          tap((params) => {
            const id = params.get('id');
            if (id) {
              this.postId = Number(id);
              if (this.isConnection) this.postsService.lockPost(this.postId).subscribe();
            }
          }),
          switchMap(() => {
            if (this.postId) return this.loadPostData(this.postId);
            else return of(null);
          }),
        )
        .subscribe({
          next: (post) => resolve(post),
          error: (err) => reject(err),
        });
    });
  }

  private loadPostData(postId: number): Observable<any> {
    if (!postId) return EMPTY;
    if (this.isConnection) {
      console.log('server');
      return this.postsService.getById(postId);
    } else {
      console.log('bd');
      return from(this.dataBaseService.get(STORAGE_KEYS.POSTS)).pipe(
        map((postsResult) => postsResult.results.find((post: any) => post.id === postId)),
      );
    }
  }

  private getFilters() {
    return JSON.parse(
      localStorage.getItem(this.sessionService.getLocalStorageNameMapper('filters'))!,
    );
  }

  private initNetworkListener() {
    this.networkService.networkStatus$.pipe(untilDestroyed(this)).subscribe({
      next: (value) => {
        console.log('initNetworkListener', value);
        this.setConnectionStatus(value);
      },
    });
  }

  private setConnectionStatus(status: boolean) {
    this.isConnection = status;
    this.connectionInfo = status
      ? ''
      : 'The connection was lost, the information will be saved to the database';
  }

  async getSurveys(): Promise<any[]> {
    if (this.isConnection) {
      try {
        const response: any = await this.surveysService
          .getSurveys('', {
            page: 1,
            order: 'asc',
            limit: 0,
          })
          .toPromise();
        await this.dataBaseService.set(STORAGE_KEYS.SURVEYS, response.results);
        return response.results;
      } catch (err) {
        console.log(err);
        return this.loadSurveyFormLocalDB();
      }
    } else {
      return this.loadSurveyFormLocalDB();
    }
  }

  private transformSurveys() {
    this.surveyListOptions = this.surveyList.map((item: any) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
  }

  clearData() {
    this.relatedPosts = [];
    this.fileToUpload = null;
    this.selectedSurvey = null;

    if (this.form?.controls) {
      for (const control in this.form.controls) {
        this.form.removeControl(control);
      }
    }
  }

  getDefaultValues(field: any) {
    const defaultValues: any = {
      date: dateHelper.setDate(dayjs()),
      location: { lat: '', lng: '' },
      number: 0,
    };

    const types = ['upload', 'tags', 'location', 'checkbox', 'select', 'radio', 'date', 'datetime'];

    return types.includes(field.input)
      ? defaultValues[field.input]
      : field.default || defaultValues[field.input] || '';
  }

  createField(field: any, value: any) {
    return this.fieldsFormArray.includes(field.type)
      ? new PostEditForm(this.formBuilder).addFormArray(value, field)
      : new PostEditForm(this.formBuilder).addFormControl(value, field);
  }

  loadForm(updateContent?: PostContent[]) {
    if (!this.selectedSurveyId) return;
    this.clearData();

    this.selectedSurvey = this.surveyList.find((item: any) => item.id === this.selectedSurveyId);
    this.color = this.selectedSurvey?.color;
    this.tasks = this.selectedSurvey?.tasks;

    const fields: any = {};
    for (const task of this.tasks ?? []) {
      task.fields
        .sort((a: any, b: any) => a.priority - b.priority)
        .map((field: any) => {
          switch (field.type) {
            case 'title':
              this.title = field.default;
              break;
            case 'description':
              this.description = field.default;
              break;
            case 'relation':
              const { relationConfigForm, relationConfigSource, relationConfigKey } =
                prepareRelationConfig(field, this.filters);
              this.relationConfigForm = relationConfigForm;
              this.relationConfigSource = relationConfigSource;
              this.relationConfigKey = relationConfigKey;
              break;
          }

          if (field.key) {
            const value = this.getDefaultValues(field);
            field.value = value;
            fields[field.key] = this.createField(field, value);

            if (field.type === 'point') {
              this.locationRequired = field.required;
              if (value.lat === '' || value.lng === '') this.emptyLocation = true;
            }
          }
        });
    }

    this.taskForm = this.formBuilder.group(postHelpers.checkTaskControls(this.tasks), {
      validators: postHelpers.requiredTasksValidator,
    });

    this.form = new FormGroup(fields);
    this.initialFormData = this.form.value;

    if (updateContent) {
      this.updateForm(updateContent);
    }
  }

  public changeLocation(data: any, formKey: string) {
    const { location, error } = data;
    const { lat, lng } = location;

    this.updateFormControl(formKey, { lat: lat, lng: lng });

    this.emptyLocation = error;
    this.cdr.detectChanges();
  }

  public setCalendar(event: any, key: any, type: string) {
    this.updateFormControl(key, dateHelper.setDate(event.detail.value, type));
  }

  private async loadSurveyFormLocalDB() {
    return this.dataBaseService.get(STORAGE_KEYS.SURVEYS);
  }

  private updateForm(updateValues: any[]) {
    type InputHandlerType =
      | 'tags'
      | 'checkbox'
      | 'location'
      | 'date'
      | 'datetime'
      | 'radio'
      | 'text'
      | 'upload'
      | 'video'
      | 'textarea'
      | 'relation'
      | 'number';
    type TypeHandlerType = 'title' | 'description';

    const inputHandlers: Partial<{ [key in InputHandlerType]: (key: string, value: any) => void }> =
      {
        tags: this.handleTags.bind(this),
        checkbox: this.handleCheckbox.bind(this),
        location: this.handleLocation.bind(this),
        date: this.handleDate.bind(this),
        datetime: this.handleDateTime.bind(this),
        upload: this.handleUpload.bind(this),
        relation: this.handleRelation.bind(this),
      };

    const typeHandlers: { [key in TypeHandlerType]: (key: string) => void } = {
      title: this.handleTitle.bind(this),
      description: this.handleDescription.bind(this),
    };

    for (const { fields } of updateValues) {
      for (const { type, input, key, value } of fields) {
        this.updateFormControl(key, value);
        if (inputHandlers[input as InputHandlerType]) {
          inputHandlers[input as InputHandlerType]!(key, value);
        } else {
          this.handleDefault.bind(this)(key, value);
        }

        if (typeHandlers[type as TypeHandlerType]) {
          typeHandlers[type as TypeHandlerType](key);
        }
      }
    }
  }

  private handleTags(key: string, value: any) {
    const formArray = this.form.get(key) as FormArray;
    value?.forEach((val: { id: any }) => formArray.push(new FormControl(val?.id)));
  }

  private async handleUpload(key: string, value: any) {
    if (!value?.value) return;
    if (value.photoUrl) {
      this.updateFormControl(key, {
        id: value.value,
        caption: value.caption,
        photo: value.photoUrl,
      });
    } else {
      try {
        const uploadObservable = this.mediaService.getById(value.value);
        const response: any = await lastValueFrom(uploadObservable);
        this.updateFormControl(key, {
          id: value.value,
          caption: response.caption,
          photo: response.original_file_url,
        });
      } catch (error: any) {
        this.form.patchValue({ [key]: null });
        throw new Error(`Error fetching file: ${error.message}`);
      }
    }
  }

  private handleDefault(key: string, value: any) {
    this.updateFormControl(key, value?.value);
  }

  private handleRelation(key: string, value: any) {
    this.updateFormControl(key, value?.value);
    this.postsService.getById(value?.value).subscribe({
      next: (post) => {
        const { id, title } = post;
        this.selectedRelatedPost = { id, title };
      },
      error: (err) => console.log(err),
    });
  }

  private handleCheckbox(key: string, value: any) {
    const data = value?.value;
    this.updateFormControl(key, data);
  }

  private handleLocation(key: string, value: any) {
    this.updateFormControl(
      key,
      value?.value
        ? { lat: value?.value.lat, lng: value?.value.lon }
        : {
            lat: '',
            lng: '',
          },
    );
  }

  private handleDate(key: string, value: any) {
    this.updateFormControl(key, value?.value ? dateHelper.setDate(value?.value, 'date') : null);
  }

  private handleDateTime(key: string, value: any) {
    this.updateFormControl(
      key,
      value?.value ? dateHelper.setDate(value?.value, 'datetimeFormat') : null,
    );
    console.log(this.form.controls[key].value);
  }

  private handleTitle(key: string) {
    this.updateFormControl(key, this.post.title);
  }

  private handleDescription(key: string) {
    this.updateFormControl(key, this.post.content ? this.post.content : '');
  }

  private updateFormControl(key: string, data: any) {
    this.form.patchValue({ [key]: data });
  }

  async preparationData(): Promise<any> {
    const fieldHandlers = {
      date: (value: any) =>
        value
          ? {
              value: dateHelper.setDate(value, 'date'),
              value_meta: { from_tz: dayjs.tz.guess() },
            }
          : { value: null },
      datetime: (value: any) =>
        value
          ? {
              value: dateHelper.setDate(value, 'datetime'),
              value_meta: { from_tz: dayjs.tz.guess() },
            }
          : { value: null },
      location: (value: any) =>
        value && value.lat ? { value: { lat: value.lat, lon: value.lng } } : { value: null },
      video: (value: any) => (value ? { value: preparingVideoUrl(value) } : {}),
    };

    for (const task of this.tasks) {
      task.fields = await Promise.all(
        task.fields.map(async (field: { key: string | number; input: string; type: string }) => {
          const fieldValue: any = this.form.value[field.key];
          let value: any = { value: fieldValue };

          if (field.type === 'title') this.title = fieldValue;
          if (field.type === 'description') this.description = fieldValue;

          if (fieldHandlers.hasOwnProperty(field.input)) {
            value = fieldHandlers[field.input as keyof typeof fieldHandlers](fieldValue);
          } else if (field.input === 'upload') {
            if (this.form.value[field.key]?.upload && this.form.value[field.key]?.photo) {
              this.fileToUpload = {
                ...this.form.value[field.key]?.photo,
                caption: this.form.value[field.key]?.caption,
                upload: this.form.value[field.key]?.upload,
              };
            } else if (this.form.value[field.key]?.delete && this.form.value[field.key]?.id) {
              this.fileToUpload = {
                fileId: this.form.value[field.key]?.id,
                delete: this.form.value[field.key]?.delete,
              };
            } else {
              value.value = this.form.value[field.key]?.id || null;
            }
          } else {
            value.value = this.form.value[field.key] || null;
          }

          return {
            ...field,
            value,
          };
        }),
      );
    }
  }

  /**
   * Checking post information and preparing data
   */
  public async submitPost(): Promise<void> {
    if (this.form.disabled) return;
    // this.form.disable();

    try {
      await this.preparationData();
    } catch (error: any) {
      this.toastService.presentToast({
        message: error,
        duration: 3000,
      });
      console.log(error);
      return;
    }

    const postData: any = {
      base_language: 'en',
      completed_stages: this.completeStages,
      content: this.description,
      description: '',
      enabled_languages: {},
      form_id: this.selectedSurveyId,
      locale: 'en_US',
      post_content: this.tasks,
      post_date: new Date().toISOString(),
      published_to: [],
      title: this.title,
      type: 'report',
    };

    if (this.fileToUpload) postData.file = this.fileToUpload;

    if (!this.form.valid) this.form.markAllAsTouched();

    this.preventSubmitIncaseTheresNoBackendValidation();

    if (this.postId) postData.post_date = this.post.post_date || new Date().toISOString();

    await this.offlineStore(postData);

    // TODO: Remove after testing
    console.log('postData', postData);

    if (this.isConnection) {
      await this.uploadPost();
    } else {
      await this.postComplete(
        'Thank you for your report. A message will be sent when the connection is restored.',
      );
      this.backNavigation();
    }
  }

  /**
   * Storing created post to indexedb
   */
  async offlineStore(postData: any) {
    const pendingPosts: any[] =
      (await this.dataBaseService.get(STORAGE_KEYS.PENDING_POST_KEY)) || [];
    pendingPosts.push(postData);
    await this.dataBaseService.set(STORAGE_KEYS.PENDING_POST_KEY, pendingPosts);
  }

  /**
   * Upload created post from indexedb
   */
  async uploadPost() {
    const pendingPosts: any[] = await this.dataBaseService.get(STORAGE_KEYS.PENDING_POST_KEY);
    for (let postData of pendingPosts) {
      if (postData?.file?.upload) {
        postData = await new UploadFileHelper(this.mediaService).uploadFile(
          postData,
          postData.file,
        );
      }

      if (postData?.file?.delete) {
        postData = await this.deleteFile(postData, postData.file);
      }

      if (this.postId) {
        this.updatePost(this.postId, postData);
      } else {
        if (!this.atLeastOneFieldHasValidationError) {
          this.createPost(postData);
        }
      }
    }
    await this.dataBaseService.set(STORAGE_KEYS.PENDING_POST_KEY, []);
  }

  async deleteFile(postData: any, { fileId }: any) {
    try {
      const deleteObservable = this.mediaService.delete(fileId);
      await lastValueFrom(deleteObservable);

      for (const content of postData.post_content) {
        for (const field of content.fields) {
          if (field.input === 'upload') {
            field.value.value = null;
          }
        }
      }

      delete postData.file;
      return postData;
    } catch (error: any) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  /** Update post */
  private updatePost(postId: number, postData: any) {
    this.postsService.update(postId, postData).subscribe({
      error: () => this.form.enable(),
      complete: async () => {
        await this.postComplete(
          'Thank you for submitting your report. The post is being reviewed by our team and soon will appear on the platform.',
        );
        this.backNavigation();
        // this.updated.emit();
      },
    });
  }

  /** Create post */
  private createPost(postData: any) {
    this.postsService.post(postData).subscribe({
      error: ({ error }) => {
        this.form.enable();
        if (error.errors[0].status === 403) {
          this.toastService.presentToast({
            message: `Failed to create a post. ${error.errors[0].message}`,
            duration: 3000,
          });
        }
      },
      complete: async () => {
        await this.postComplete(
          'Thank you for submitting your report. The post is being reviewed by our team and soon will appear on the platform.',
        );
        this.backNavigation();
      },
    });
  }

  async postComplete(message: string) {
    await this.alertService.presentAlert({
      header: 'Success!',
      message,
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
        },
      ],
    });
  }

  public async previousPage() {
    for (const key in this.initialFormData) {
      this.initialFormData[key] = this.initialFormData[key]?.value || null;
    }
    if (!objectHelpers.objectsCompare(this.initialFormData, this.form.value)) {
      const result = await this.alertService.presentAlert({
        header: 'Success!',
        message:
          'Thank you for submitting your report. The post is being reviewed by our team and soon will appear on the platform.',
      });
      if (result.role !== 'confirm') return;
    }

    if (!this.postInput) {
      this.backNavigation();
      // this.eventBusService.next({
      //   type: EventType.AddPostButtonSubmit,
      //   payload: true,
      // });
    } else {
      this.cancel.emit();
    }
  }

  public backNavigation(): void {
    this.clearData();
    this.router.navigate([
      this.queryParams['profile']
        ? 'profile/posts'
        : this.isConnection && this.postId
        ? this.postId
        : '/',
    ]);
  }

  public preventSubmitIncaseTheresNoBackendValidation() {
    /** Extra check to prevent form submission beforehand
     * incase any field shows error but has no backend validation **/
    this.form.enable();
    for (const task of this.tasks) {
      this.atLeastOneFieldHasValidationError = task.fields.some((field: any) => {
        return (
          this.form.get(field.key)?.hasError('required') ||
          this.form.get(field.key)?.hasError('minlength') ||
          this.form.get(field.key)?.hasError('invalidvideourl')
        );
      });
    }
  }

  public taskComplete({ id }: any, event: any) {
    this.taskForm.patchValue({ [id]: event.checked });
    if (event.checked) {
      this.completeStages.push(id);
    } else {
      const index = this.completeStages.indexOf(id);
      if (index >= 0) {
        this.completeStages.splice(index, 1);
      }
    }
  }

  public toggleAllSelection(checked: any, field: any, fieldKey: string) {
    if (field.key === fieldKey) {
      field.options.map((el: any) => {
        this.onCheckChange(checked, field.key, el.id);
      });
    }
  }

  public onCheckChange(
    checked: boolean,
    fieldKey: string,
    id: number,
    options?: any[],
    parentId?: number,
  ) {
    const formArray: FormArray = this.form.get(fieldKey) as FormArray;

    if (checked) {
      const hasId = formArray.controls.some((control: any) => control.value === id);
      if (!hasId) formArray.push(new FormControl(id));

      if (parentId) {
        const hasParentId = formArray.controls.some((control: any) => control.value === parentId);
        if (!hasParentId) formArray.push(new FormControl(parentId));
      }

      if (!parentId && options) {
        const children = options.filter((option) => option.parent_id === id);
        children.forEach((child) => {
          const hasChildId = formArray.controls.some((control: any) => control.value === child.id);
          if (!hasChildId) formArray.push(new FormControl(child.id));
        });
      }
    } else {
      const index = formArray.controls.findIndex((ctrl: any) => ctrl.value === id);
      if (index > -1) formArray.removeAt(index);

      if (parentId && options) {
        const children = options.filter((option: any) => option.parent_id === parentId);
        const isParentHasCheckedChild = children.some((child) =>
          formArray.controls.some((control: any) => control.value === child.id),
        );
        if (!isParentHasCheckedChild) {
          const i = formArray.controls.findIndex((ctrl: any) => ctrl.value === parentId);
          if (i > -1) formArray.removeAt(i);
        }
      }

      if (!parentId && options) {
        const children = options.filter((option) => option.parent_id === id);
        children.forEach((child) => {
          const i = formArray.controls.findIndex((ctrl: any) => ctrl.value === child.id);
          if (i > -1) formArray.removeAt(i);
        });
      }
    }
  }

  public chooseRelatedPost(event: any, { key }: any, { id, title }: any) {
    if (!event) return;
    this.form.patchValue({ [key]: id });
    this.selectedRelatedPost = { id, title };
    this.relatedPosts = [];
    this.relationSearch = '';
  }

  public relationSearchPosts() {
    const params: GeoJsonFilter = {
      order: 'desc',
      'form[]': this.relationConfigForm,
      'source[]': this.relationConfigSource,
      orderby: 'post_date',
      q: this.relationSearch,
      'status[]': [],
    };
    this.isSearching = true;
    this.postsService.getPosts('', params).subscribe({
      next: (data) => {
        this.relatedPosts = data.results;
        this.isSearching = false;
      },
      error: () => (this.isSearching = false),
    });
  }

  public deleteRelatedPost({ key }: any, { id }: any) {
    if (this.form.controls[key].value === id) {
      this.form.patchValue({ [key]: '' });
    }
    this.selectedRelatedPost = null;
  }

  public trackById(item: any): number {
    return item.id;
  }

  public generateSecurityTrustUrl(unsafeUrl: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
  }

  public changeSelectionFields(checked: boolean, fieldKey: string, item: any) {
    if (checked) {
      this.checkedList = this.form.controls[fieldKey].value || [];
      this.checkedList.push(item);
      this.form.patchValue({ [fieldKey]: this.checkedList });
    } else {
      this.checkedList = this.form.controls[fieldKey].value;
      const index = this.checkedList.indexOf(item);
      if (index >= 0) {
        this.checkedList.splice(index, 1);
        this.form.patchValue({ [fieldKey]: this.checkedList });
      }
    }
  }

  public getDate(value: any, format: string): string {
    return dateHelper.getDateWithTz(value, format);
  }
}
