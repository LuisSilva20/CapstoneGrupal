import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from '../interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usersCollection = 'users';

  constructor(private auth: Auth, private firestore: Firestore) {}

  // 🔹 Buscar usuario en Firestore por UID
  private async getUserByUid(uid: string): Promise<User | null> {
    const userDoc = doc(this.firestore, `${this.usersCollection}/${uid}`);
    const snap = await getDoc(userDoc);
    return snap.exists() ? { ...(snap.data() as User), id: uid } : null;
  }

  // 🔹 Guardar usuario en Firestore
  private async saveUserFirestore(data: Omit<User, 'id'>, uid: string): Promise<User> {
    const userDoc = doc(this.firestore, `${this.usersCollection}/${uid}`);
    await setDoc(userDoc, { ...data, id: uid });
    return { ...data, id: uid };
  }

  // 🔹 Guardar sesión en sessionStorage
  private saveSession(user: User) {
    sessionStorage.setItem('username', user.username ?? '');
    sessionStorage.setItem('email', user.email ?? '');
    sessionStorage.setItem('nombre', user.nombre ?? '');
    sessionStorage.setItem('apellidos', user.apellidos ?? '');
    sessionStorage.setItem('ingresado', 'true');
  }

  // 🔹 Registro con email
  async registerWithEmail(data: {
    nombre: string;
    apellidos?: string;
    email: string;
    username?: string;
    password: string;
  }) {
    const cred = await createUserWithEmailAndPassword(this.auth, data.email, data.password);
    const fbUser = cred.user;

    const newUser: Omit<User, 'id'> = {
      nombre: data.nombre,
      apellidos: data.apellidos ?? '',
      email: data.email,
      username: data.username ?? data.email.split('@')[0],
      password: '',
      isactive: true
    };

    const creado = await this.saveUserFirestore(newUser, fbUser.uid);
    this.saveSession(creado);

    return { success: true, user: creado };
  }

  // 🔹 Login con email
  async loginWithEmail(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    const fbUser = cred.user;

    let user = await this.getUserByUid(fbUser.uid);
    if (!user) {
      user = await this.saveUserFirestore({
        nombre: fbUser.displayName ?? '',
        apellidos: '',
        email: fbUser.email ?? email,
        username: (fbUser.email ?? email).split('@')[0],
        password: '',
        isactive: true
      }, fbUser.uid);
    }

    this.saveSession(user);
    return { success: true, user };
  }

  // 🔹 Login con Google
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const fbUser = result.user;

    let user = await this.getUserByUid(fbUser.uid);
    if (!user) {
      const parts = (fbUser.displayName ?? '').split(' ');
      const nombre = parts.shift() ?? '';
      const apellidos = parts.join(' ');
      user = await this.saveUserFirestore({
        nombre,
        apellidos,
        email: fbUser.email!,
        username: fbUser.email!.split('@')[0],
        password: '',
        isactive: true
      }, fbUser.uid);
    }

    this.saveSession(user);
    return { success: true, user };
  }

  // 🔹 Logout
  logout() {
    sessionStorage.clear();
    return signOut(this.auth);
  }
}
