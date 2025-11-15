import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, from, map } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IniciadoGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: Auth,
    private toastController: ToastController
  ) {}

  canActivate(): Observable<boolean> {
    return from(this.auth.currentUser ? Promise.resolve(true) : Promise.resolve(false)).pipe(
      map(loggedIn => {
        if (!loggedIn) {
          this.showToast('Debe iniciar sesión');
          this.router.navigateByUrl('/inicio-sesion');
          return false;
        }
        return true;
      })
    );
  }

  private async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }
}
