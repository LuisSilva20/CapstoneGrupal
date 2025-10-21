import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
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
  IonAvatar,
  IonIcon
} from '@ionic/angular/standalone';
import { Api } from 'src/app/servicios/api';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { User } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  templateUrl: './inicio-sesion.page.html',
  styleUrls: ['./inicio-sesion.page.scss'],
  imports: [
    IonIcon, IonAvatar,
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

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.inicioSesionForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ionViewWillEnter() {
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.inicioSesionForm.reset({
      username: '',
      password: '',
    });
  }

  async iniciarSesion() {
    if (!this.inicioSesionForm.valid) {
      this.showAlert('Error', 'Por favor completa todos los campos correctamente.');
      return;
    }

    const identifier = this.inicioSesionForm.value.username.trim();
    const password = this.inicioSesionForm.value.password;

    try {
      const resp: User[] = (await this.api.GetUserByUsernameOrEmail(identifier).toPromise()) ?? [];

      if (!resp || resp.length === 0) {
        this.showAlert('Usuario no existe', 'Debe registrarse primero.');
        return;
      }

      const usuario = resp[0];

      if (!usuario.isactive) {
        this.showAlert('Usuario inactivo', 'Contacta al administrador.');
        return;
      }

      if (usuario.password !== password) {
        this.showAlert('Error', 'Contraseña incorrecta.');
        return;
      }

      // Guardar datos del usuario en sessionStorage para el perfil
      sessionStorage.setItem('username', usuario.username);
      sessionStorage.setItem('email', usuario.email);
      sessionStorage.setItem('nombre', usuario.nombre);
      sessionStorage.setItem('apellidos', usuario.apellidos);
      sessionStorage.setItem('ingresado', 'true');
      if ((usuario as any).idCurso) {
        sessionStorage.setItem('userCursoId', (usuario as any).idCurso.toString());
      }

      const toast = await this.toastCtrl.create({
        message: 'Sesión iniciada correctamente!',
        duration: 2000,
      });
      await toast.present();

      this.router.navigateByUrl('/inicio');
    } catch (error) {
      console.error('Error en iniciarSesion():', error);
      this.showAlert('Error', 'Ocurrió un error al intentar iniciar sesión.');
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['Ok'],
    });
    await alert.present();
  }
}
