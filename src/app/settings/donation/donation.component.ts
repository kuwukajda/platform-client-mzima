import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DonationConfigInterface, SiteConfigInterface } from '@models';
import { ConfigService, MediaService, NotificationService, SessionService } from '@services';
import { tap } from 'rxjs';

@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.scss'],
})
export class DonationComponent implements OnInit {
  donationConfig: DonationConfigInterface;
  public donationForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: ['', []],
    wallet: ['', []],
  });

  constructor(
    private formBuilder: FormBuilder,
    private sessionService: SessionService,
    private mediaService: MediaService,
    private notificationService: NotificationService,
    private configService: ConfigService,
  ) {}

  ngOnInit(): void {
    this.donationConfig = (
      this.sessionService.getConfigurations('site') as SiteConfigInterface
    ).donation!;
    console.log('DONATION!', this.donationConfig);
    this.donationForm.patchValue({
      title: this.donationConfig.title,
      description: this.donationConfig.description,
      wallet: this.donationConfig.wallet,
    });
  }

  deleteImage(id: number) {
    this.donationConfig.images = this.donationConfig.images.filter((image) => image.id !== id);
  }

  uploadFile($event: any) {
    if (this.validateFile($event.target.files[0])) {
      var reader = new FileReader();
      reader.onload = () => {
        this.mediaService.uploadFile($event.target.files[0]).subscribe((result: any) => {
          this.donationConfig.images.push({
            id: result.id,
            original_file_url: result.original_file_url,
          });
        });
      };
      reader.readAsDataURL($event.target.files[0]);
    } else {
      this.notificationService.showError('post.media.error_in_upload');
    }
  }

  private validateFile(file: File) {
    const mimeReg = /[\/.](gif|jpg|jpeg|png)$/i;
    return mimeReg.test(file.type) && file.size < 1048576;
  }

  save() {
    const donation: DonationConfigInterface = Object.assign({}, this.donationForm.value, {
      images: this.donationConfig.images,
    });
    this.configService.update('site', { donation }).pipe(tap());
  }
}
