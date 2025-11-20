import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel,
  IonButton, IonInput, IonList
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/servicios/auth';
import { User } from 'src/app/interfaces/interfaces';

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  templateUrl: './inicio-sesion.page.html',
  styleUrls: ['./inicio-sesion.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonInput,
    IonList,
  ],
})
export class InicioSesionPage {

  inicioSesionForm: FormGroup;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.inicioSesionForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  private esEmail(valor: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
  }

  async iniciarSesion() {
    if (!this.inicioSesionForm.valid) return;

    let { identifier, password } = this.inicioSesionForm.value;

    identifier = identifier.trim();

    this.cargando = true;
    try {
      let res: AuthResponse;

      // Si es un correo → login con email
      if (this.esEmail(identifier)) {
        res = await this.authService.loginWithEmail(identifier, password);
      }
      // Si NO lo es → login con nombre de usuario
      else {
        res = await this.authService.login(identifier, password)
;
      }

      if (!res.success) {
        this.showAlert('Error', res.error ?? 'Error al iniciar sesión');
        return;
      }

      const toast = await this.toastCtrl.create({
        message: 'Sesión iniciada!',
        duration: 2000,
      });

      toast.present();
      this.router.navigateByUrl('/inicio');

    } finally {
      this.cargando = false;
    }
  }

  async loginGoogle() {
    this.cargando = true;

    try {
      const res: AuthResponse = await this.authService.loginWithGoogle();

      if (!res.success) {
        this.showAlert('Error', res.error ?? 'Error al iniciar sesión con Google');
        return;
      }

      const toast = await this.toastCtrl.create({
        message: 'Sesión con Google iniciada!',
        duration: 2000,
      });

      toast.present();
      this.router.navigateByUrl('/inicio');

    } finally {
      this.cargando = false;
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });

    alert.present();
  }
}
