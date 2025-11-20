import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel,
  IonButton, IonBackButton, IonInput
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/servicios/auth';
import { User, AuthResponse } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-registrarse',
  standalone: true,
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonBackButton,
    IonInput
  ]
})
export class RegistrarsePage {
  registerForm: FormGroup;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.registerForm = this.fb.group({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      apellidos: new FormControl('', [Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(100)]),
      username: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(30)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required])
    });
  }

  async registrarse() {
    if (this.registerForm.invalid) {
      this.mostrarAlerta('Por favor completa todos los campos correctamente.');
      return;
    }

    const formValue = this.registerForm.value;

    if (formValue.password !== formValue.confirmPassword) {
      this.mostrarAlerta('Las contraseñas no coinciden.');
      return;
    }

    this.cargando = true;

    try {
      const userData: Omit<User, 'id'> = {
        nombre: formValue.nombre.trim(),
        apellidos: formValue.apellidos?.trim(),
        email: formValue.email.trim(),
        username: formValue.username.trim(),
        password: formValue.password,
        confirmPassword: formValue.confirmPassword,
        isactive: true,
        examHistory: [],
        learningProgress: {},
        cursosCompletados: [],
        progreso: 0
      };

      const res: AuthResponse = await this.authService.register(userData, formValue.password);

      if (!res.success) {
        this.mostrarAlerta(res.error ?? 'Error al crear el usuario');
        return;
      }

      this.mostrarAlerta('Usuario creado con éxito');
      this.registerForm.reset();
      this.router.navigate(['inicio-sesion']);

    } catch (err) {
      this.mostrarAlerta('Error al crear el usuario');
    } finally {
      this.cargando = false;
    }
  }

  async mostrarAlerta(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: 'top',
      duration: 3000,
      color: 'warning',
    });
    toast.present();
  }

  get f() {
    return this.registerForm.controls;
  }
}
