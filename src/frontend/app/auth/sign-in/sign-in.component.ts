import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AuthResponseDto } from '@backend/auth/dto/auth-response.dto';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.sass'],
})
export class SignInComponent {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      username: '',
      password: '',
    });
  }

  onSubmit(): void {
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    this.authService
      .signIn(username, password)
      .subscribe((authResponse: AuthResponseDto) => {
        console.log(authResponse);
      });

    if (!this.authService.user) {
      this.router.navigate(['/']);
    }
  }
}
