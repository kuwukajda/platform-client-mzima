import { Component, Input, OnChanges } from '@angular/core';
import { PostPropertiesInterface } from '@models';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
})
export class PostPreviewComponent implements OnChanges {
  @Input() post: PostPropertiesInterface;
  @Input() feedView: boolean;
  private details = new Subject<boolean>();
  public details$ = this.details.asObservable();

  ngOnChanges(changes: any) {
    console.log('ngOnChanges> ', changes);
  }

  public showDetails(): void {
    this.details.next(true);
  }
}
