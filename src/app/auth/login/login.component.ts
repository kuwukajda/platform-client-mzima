import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BreakpointService } from '@services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public isDesktop$ = this.breakpointService.isDesktop$;
  public isSignupActive: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private matDialogRef: MatDialogRef<LoginComponent>,
    private breakpointService: BreakpointService,
  ) {
    this.isSignupActive = this.data.isSignupActive;
  }

  public cancel() {
    this.matDialogRef.close('cancel');
  }

  public loggined(state: boolean): void {
    this.matDialogRef.close(state);
  }
}
