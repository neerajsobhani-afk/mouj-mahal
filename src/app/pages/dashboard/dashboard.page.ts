import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  checkmarkCircleOutline,
  notificationsOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ]
})
export class DashboardPage implements OnInit {
  todayEntries = 124;

  constructor() {
    addIcons({
      personOutline,
      checkmarkCircleOutline,
      notificationsOutline
    });
  }

  ngOnInit() {}
}
