import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FooterAdmin } from '../footer-admin/footer-admin';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, FooterAdmin]
})
export class SignUp implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  signUpError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.signupForm.invalid){
       this.signUpError = 'Please fill in the details first.';
       return;
    }

    const { email, password } = this.signupForm.value;

    this.authService.signUp(email, password)
      .then(async res => {
        const uid = res.user.uid;

        const profile = { 
          email,
          createdAt: new Date().toISOString()
        };

        this.router.navigate(['/admin']);
        if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });

        await this.authService.saveUserProfile(uid, profile);
      })
      .catch(err => {
        this.signUpError = err.code === 'auth/email-already-in-use' ? 
          'This email is already in use.' : 'Sign up failed. Try again.';
      });
  }

  goToSignIn() {
    this.router.navigate(['/sign-in']);
    if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}