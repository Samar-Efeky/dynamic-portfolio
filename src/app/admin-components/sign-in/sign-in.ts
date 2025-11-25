// sign-in.ts
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { FooterAdmin } from "../footer-admin/footer-admin";
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sign-in',
  imports: [ ReactiveFormsModule, FooterAdmin],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.scss'],
  standalone: true
})
export class SignIn implements OnInit {
  signInForm!: FormGroup;
  showPassword = false;
  signInError = '';
  resetError = '';
  text = 'Make Your Portfolio';
  letters: string[] = [];

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.letters = this.text.split(' ');
  }

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: ['samar@gmail.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

 signIn() {
  // لو الفورم فاضي أو فيه أخطاء
  if (this.signInForm.invalid) {
    this.signInError = 'Please fill in the details first.';
    return;
  }

  const { email, password } = this.signInForm.value;

  this.authService.signIn(email, password)
    .then(() => {
      this.router.navigate(['/admin']);
      if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch((err) => {
      if (err.code === 'auth/invalid-credential') {
        this.signInError = 'Invalid email or password.';
      } else {
        this.signInError = 'Sign in failed. Please try again later.';
      }
    });
}

  signInWithGoogle() {
    this.authService.signInWithGoogle()
      .then(() => {
        this.router.navigate(['/admin']);
        if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(err => console.error(err));
  }

  goToSignUp() {
    this.router.navigate(['/sign-up']);
    if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
