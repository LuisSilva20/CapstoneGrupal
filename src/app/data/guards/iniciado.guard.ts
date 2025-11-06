import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Api } from 'src/app/servicios/api';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IniciadoGuard implements CanActivate {

  constructor(
    private router: Router,
    private api: Api,
    private toastController: ToastController
  ) {}

  canActivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (!this.api.isLogged()) {  // <-- Revisa sesión correctamente
      this.showToast('Debe iniciar sesión');
      this.router.navigateByUrl('/inicio-sesion');
      return false;
    }
    return true;
  }

  private async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }
}
