import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSpinner,
  IonIcon,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  keyOutline,
  mailOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonSpinner,
    IonIcon
  ]
})
export class LoginPage implements OnInit {
  private fb = inject(FormBuilder);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm!: FormGroup;
  showPassword = false;
  isSubmitting = false;
  submitted = false;

  constructor() {
    addIcons({
      personOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      arrowForwardOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      keyOutline,
      mailOutline
    });
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email.trim(), password).subscribe({
      next: async (res) => {
        this.isSubmitting = false;

        if (res.success) {
          this.authService.saveUser(res.data);
          const role = res.data.role || res.data.serviceType || res.data.service_type || res.data.user_type || 'Ticket Manager';
          this.authService.saveServiceType(role);

          const toast = await this.toastCtrl.create({
            message: `Welcome back, ${res.data.name || res.data.firstName || 'User'}!`,
            duration: 2500,
            position: 'top',
            color: 'success',
            icon: 'checkmark-circle-outline'
          });
          await toast.present();

          this.router.navigate(['/tabs/dashboard']);
        } else {
          const toast = await this.toastCtrl.create({
            message: res.message || 'Login failed. Please check credentials.',
            duration: 3000,
            position: 'top',
            color: 'danger',
            icon: 'alert-circle-outline'
          });
          await toast.present();
        }
      },
      error: async (err) => {
        this.isSubmitting = false;
        const errorMsg = err?.error?.message || 'Server error. Please check your internet connection.';
        const toast = await this.toastCtrl.create({
          message: errorMsg,
          duration: 3000,
          position: 'top',
          color: 'danger',
          icon: 'alert-circle-outline'
        });
        await toast.present();
      }
    });
  }

  async onForgotPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Reset Password',
      subHeader: 'Enter your registered email address',
      inputs: [
        {
          name: 'identity',
          type: 'text',
          placeholder: 'Registered Email',
          value: this.loginForm.get('email')?.value || ''
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Send Reset Link',
          cssClass: 'alert-button-confirm',
          handler: async (data) => {
            if (!data.identity || data.identity.trim() === '') {
              const toast = await this.toastCtrl.create({
                message: 'Please enter a valid email address.',
                duration: 2000,
                color: 'warning',
                position: 'bottom'
              });
              await toast.present();
              return false;
            }

            const toast = await this.toastCtrl.create({
              message: `Password reset instructions sent to ${data.identity}`,
              duration: 3000,
              color: 'primary',
              position: 'top',
              icon: 'key-outline'
            });
            await toast.present();
            return true;
          }
        }
      ]
    });

    await alert.present();
  }
}
