import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPostModalComponent, CreateComponent } from '@post';
import { EventBusService, EventType, BreakpointService } from '@services';

@Component({
  selector: 'app-submit-post-button',
  templateUrl: './submit-post-button.component.html',
  styleUrls: ['./submit-post-button.component.scss'],
})
export class SubmitPostButtonComponent implements OnInit {
  public isDesktop = false;

  constructor(
    private dialog: MatDialog,
    private eventBusService: EventBusService,
    private breakpointService: BreakpointService,
  ) {
    this.breakpointService.isDesktop.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }

  ngOnInit() {
    this.eventBusService.on(EventType.AddPostButtonSubmit).subscribe({
      next: () => this.addPost(),
    });
  }

  public async addPost(): Promise<void> {
    const dialogRef = this.dialog.open(AddPostModalComponent, {
      width: '100%',
      maxWidth: 615,
      panelClass: 'modal',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        if (response?.type) {
          this.dialog.open(CreateComponent, {
            height: '95vh',
            width: '615px',
            data: response.type,
            panelClass: ['modal', 'create-post-modal'],
          });
        }
      },
    });
  }
}
