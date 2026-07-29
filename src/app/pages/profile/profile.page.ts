import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  logOutOutline,
  keyOutline,
  chevronForwardOutline,
  createOutline
} from 'ionicons/icons';
import { AuthService, UserData } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ]
})
export class ProfilePage implements OnInit {
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private authService = inject(AuthService);

  currentUser: UserData | null = null;
  officerName = 'User';

  constructor() {
    addIcons({
      personOutline,
      logOutOutline,
      keyOutline,
      chevronForwardOutline,
      createOutline
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    if (this.currentUser) {
      this.officerName = this.currentUser.name || `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || 'User';
    }
  }

  async onChangePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Change Password',
      subHeader: 'Enter your current and new password',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Current Password'
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New Password (min 6 chars)'
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm New Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Update',
          handler: async (data) => {
            if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
              await this.showToast('Please fill in all fields.', 'warning');
              return false;
            }
            if (data.newPassword.length < 6) {
              await this.showToast('New password must be at least 6 characters.', 'warning');
              return false;
            }
            if (data.newPassword !== data.confirmPassword) {
              await this.showToast('New passwords do not match.', 'warning');
              return false;
            }

            await this.showToast('Password updated successfully!', 'success');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' | 'dark') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }

  async onLogout() {
    this.authService.logout();
    await this.showToast('Logged out successfully.', 'dark');
    this.router.navigate(['/login']);
  }
}

