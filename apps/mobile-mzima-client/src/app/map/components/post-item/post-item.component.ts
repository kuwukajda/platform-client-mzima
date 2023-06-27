import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MediaService, PostResult, PostStatus, PostsService } from '@mzima-client/sdk';
import {
  getPostItemActions,
  PostItemActionType,
  PostItemActionTypeUserRole,
  postStatusChangedHeader,
  postStatusChangedMessage,
} from '@constants';
import { ActionSheetButton, ModalController } from '@ionic/angular';
import { AlertService, EnvService, SessionService, ShareService, ToastService } from '@services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { cloneDeep } from 'lodash';
import { CollectionsModalComponent } from '../../../shared/components/collections-modal/collections-modal.component';
import { Router } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.scss'],
})
export class PostItemComponent implements OnInit {
  @Input() public post: PostResult;
  @Output() public postUpdated = new EventEmitter<{ post: PostResult }>();
  @Output() public postDeleted = new EventEmitter<{ post: PostResult }>();
  public media: any;
  public mediaId?: number;
  public isMediaLoading: boolean;
  public isActionsOpen = false;
  public actionSheetButtons?: ActionSheetButton[] = getPostItemActions();

  constructor(
    private mediaService: MediaService,
    protected sessionService: SessionService,
    private alertService: AlertService,
    private toastService: ToastService,
    private postsService: PostsService,
    private shareService: ShareService,
    private envService: EnvService,
    private modalController: ModalController,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sessionService.currentUserData$.pipe(untilDestroyed(this)).subscribe({
      next: ({ role, userId }) => {
        if (role === 'admin') {
          this.actionSheetButtons = getPostItemActions(PostItemActionTypeUserRole.ADMIN);
        } else if (String(userId) === String(this.post.user_id)) {
          this.actionSheetButtons = getPostItemActions(PostItemActionTypeUserRole.AUTHOR);
        } else if (role === 'member') {
          this.actionSheetButtons = getPostItemActions(PostItemActionTypeUserRole.USER);
        } else {
          this.actionSheetButtons = getPostItemActions();
        }
      },
    });

    this.mediaId = this.post.post_content
      ?.flatMap((c) => c.fields)
      .find((f) => f.input === 'upload')?.value?.value;

    if (this.mediaId) {
      this.isMediaLoading = true;
      this.mediaService.getById(String(this.mediaId)).subscribe({
        next: (media) => {
          this.isMediaLoading = false;
          this.media = media;
        },
        error: () => {
          this.isMediaLoading = false;
        },
      });
    }
  }

  public makeAction(ev: any) {
    this.isActionsOpen = false;
    const role = ev.detail.role;
    if (role === 'cancel' || !ev.detail.data) return;
    const action: PostItemActionType = ev.detail.data.action;

    const actions: Record<PostItemActionType, () => void> = {
      [PostItemActionType.SHARE]: () =>
        this.shareService.share({
          title: this.post.title,
          text: this.post.title,
          url: `${this.envService.deploymentUrl}feed/${this.post.id}/view?mode=POST`,
          dialogTitle: 'Share Post',
        }),
      [PostItemActionType.EDIT]: () => this.editPost(),
      [PostItemActionType.ADD_TO_COLLECTION]: () => this.addToCollection(),
      [PostItemActionType.PUBLISH]: () => this.setPostStatus(PostStatus.Published),
      [PostItemActionType.PUT_UNDER_REVIEW]: () => this.setPostStatus(PostStatus.Draft),
      [PostItemActionType.ARCHIVE]: () => this.setPostStatus(PostStatus.Archived),
      [PostItemActionType.DELETE]: () => this.deletePost(),
    };

    actions[action]();
  }

  private editPost(): void {
    this.router.navigate([this.post.id, 'edit']);
  }

  private async addToCollection(): Promise<void> {
    const modal = await this.modalController.create({
      component: CollectionsModalComponent,
      componentProps: {
        postId: this.post.id,
        selectedCollections: new Set(this.post.sets ?? []),
      },
    });
    modal.onWillDismiss().then(({ data }) => {
      const { collections, changed } = data ?? {};
      if (changed) {
        this.post.sets = collections;
        this.postUpdated.emit({ post: this.post });
        this.toastService.presentToast({
          header: 'Success',
          message: `The post “${this.post.title}” was ${
            collections?.length
              ? `added in ${collections.length} collections`
              : 'removed from all collections'
          }.`,
          buttons: [],
        });
      }
    });
    modal.present();
  }

  private setPostStatus(status: PostStatus): void {
    this.postsService.updateStatus(this.post.id, status).subscribe((res) => {
      this.post = res.result;
      this.postUpdated.emit({ post: this.post });
      this.toastService.presentToast({
        header: postStatusChangedHeader[status],
        message: postStatusChangedMessage(status, this.post.title),
        buttons: [],
      });
    });
  }

  private async deletePost(): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: 'Are you sure you want to delete this post?',
      message: 'This action cannot be undone. Please proceed with caution.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          cssClass: 'danger',
        },
      ],
    });

    if (result.role === 'confirm') {
      const post = cloneDeep(this.post);
      this.postsService.delete(this.post.id).subscribe({
        next: () => {
          this.postDeleted.emit({ post });
          this.toastService.presentToast({
            message: 'Post has been successfully deleted',
          });
        },
      });
    }
  }

  public showOptions(ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.isActionsOpen = true;
  }
}
