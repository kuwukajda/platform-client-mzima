import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private matDialogRef: MatDialogRef<LoginComponent>,
  ) {}

  getErrorMessage(field: string) {
    if (this.form.controls[field].hasError('required')) {
      return 'You must enter a value';
    }

    return this.form.controls['email'].hasError('email') ? 'Not a valid email' : '';
  }

  cancel() {
    this.matDialogRef.close('cancel');
  }

  login() {
    const { email, password } = this.form.value;
    this.form.disable();
    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.matDialogRef.close(response);
      },
      error: () => {
        this.form.enable();
      },
    });
  }
}
