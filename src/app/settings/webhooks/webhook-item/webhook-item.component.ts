import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntilDestroy$ } from '@helpers';
import { FormAttributeInterface, SurveyItem, WebhookResultInterface } from '@models';
import { FormsService, ConfirmModalService, SurveysService, WebhooksService } from '@services';

@Component({
  selector: 'app-webhook-item',
  templateUrl: './webhook-item.component.html',
  styleUrls: ['./webhook-item.component.scss'],
})
export class WebhookItemComponent implements OnInit {
  private webhook: WebhookResultInterface;
  public form: FormGroup = this.formBuilder.group({
    allowed_privileges: [''],
    created: [''],
    destination_field_key: [null],
    entity_type: ['', [Validators.required]],
    event_type: ['', [Validators.required]],
    form_id: [0],
    id: [0],
    name: ['', [Validators.required]],
    shared_secret: ['', [Validators.required]],
    source_field_key: [null],
    updated: [''],
    url: ['', [Validators.required]],
    user: [''],
    webhook_uuid: [''],
    is_source_destination: [false],
  });
  public eventList = [
    { name: 'Create', value: 'create' },
    { name: 'Update', value: 'update' },
  ];
  public entityList = [{ name: 'Post', value: 'post' }];
  public surveyList: SurveyItem[] = [];
  public surveyAttributesList: FormAttributeInterface[] = [];
  private controlFormIdData$ = this.form.controls['form_id'].valueChanges.pipe(takeUntilDestroy$());
  public isCreateWebhook = false;

  constructor(
    private route: ActivatedRoute,
    private webhooksService: WebhooksService,
    private formBuilder: FormBuilder,
    private surveysService: SurveysService,
    private formsService: FormsService,
    private router: Router,
    private confirmModalService: ConfirmModalService,
  ) {}

  ngOnInit(): void {
    this.getSurveys();
    this.route.paramMap.subscribe({
      next: (params: ParamMap) => {
        if (params.get('id')) {
          this.getWebhook(params.get('id')!);
          this.isCreateWebhook = false;
        } else {
          this.isCreateWebhook = true;
        }
      },
      error: (err) => console.log(err),
    });

    if (this.form.controls['form_id'].value)
      this.getSurveyAttributes(this.form.controls['form_id'].value);

    this.controlFormIdData$.subscribe({
      next: (surveyId) => {
        if (surveyId) this.getSurveyAttributes(surveyId);
      },
      error: (err) => console.log(err),
    });
  }

  private getWebhook(id: string) {
    this.webhooksService.getById(id).subscribe({
      next: (webhook) => {
        this.webhook = webhook;
        this.fillInForm(webhook);
      },
      error: (err) => console.log(err),
    });
  }

  private fillInForm(data: any): void {
    Object.keys(data).forEach((name) => {
      if (this.form.controls[name]) {
        this.form.controls[name].patchValue(data[name]);
      }
    });
    this.form.controls['is_source_destination'].patchValue(!!this.form.controls['form_id'].value);
  }

  private getSurveys(): void {
    this.surveysService.get().subscribe({
      next: (response) => (this.surveyList = response.results),
      error: (err) => console.log(err),
    });
  }

  private getSurveyAttributes(id: number): void {
    this.formsService.getAttributes(id.toString()).subscribe({
      next: (response) => {
        this.surveyAttributesList = response;
        this.fillInForm({
          destination_field_key: this.checkKeyFields(this.webhook?.destination_field_key!),
          source_field_key: this.checkKeyFields(this.webhook?.source_field_key!),
        });
      },
      error: (err) => console.log(err),
    });
  }

  private checkKeyFields(field: string): any {
    if (field === 'title' || field === 'content') {
      return this.filterAttributes('type', field === 'title' ? field : 'description')?.key;
    } else if (field) {
      return field.replace(/values./gi, '');
    }
  }

  private filterAttributes(param: string, value: string) {
    return this.surveyAttributesList.find((el: any) => el[param] === value);
  }

  private fillForApi(obj: any): string {
    if (obj.type === 'title' || obj.type === 'description') {
      return obj.type === 'title' ? obj.type : 'content';
    } else {
      return `values.${obj.key}`;
    }
  }

  public save() {
    if (this.form.value.is_source_destination) {
      this.fillInForm({
        destination_field_key: this.fillForApi(
          this.filterAttributes('key', this.form.controls['destination_field_key'].value),
        ),
        source_field_key: this.fillForApi(
          this.filterAttributes('key', this.form.controls['source_field_key'].value),
        ),
      });
    }
    this.deleteFormFields(['is_source_destination']);
    this.isCreateWebhook ? this.postWebhook() : this.updateWebhook();
  }

  private postWebhook() {
    this.deleteFormFields(['id', 'created', 'updated', 'allowed_privileges', 'user']);
    this.webhooksService.post(this.form.value).subscribe({
      next: () => this.navigateToWebhooks(),
      error: (err) => console.log(err),
    });
  }

  private updateWebhook() {
    this.webhooksService.update(this.form.controls['id'].value, this.form.value).subscribe({
      next: () => this.navigateToWebhooks(),
      error: (err) => console.log(err),
    });
  }

  public cancel() {
    this.navigateToWebhooks();
  }

  private navigateToWebhooks() {
    this.router.navigate(['/settings/webhooks']);
  }

  private deleteFormFields(fields: Array<string>) {
    for (const field of fields) {
      delete this.form.value[field];
    }
  }

  public async openDialog(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.form.controls['name'].value + ' webhook will be deleted!',
      description: '<p>This action cannot be undone.</p><p>Are you sure?</p>',
    });

    if (!confirmed) return;
    this.deleteWebhook();
  }

  public deleteWebhook() {
    this.webhooksService.delete(this.form.controls['id'].value).subscribe({
      next: () => this.navigateToWebhooks(),
      error: (err) => console.log(err),
    });
  }
}
