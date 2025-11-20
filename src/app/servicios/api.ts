// src/app/servicios/api.ts
import { Injectable, Inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  query,
  where
} from '@angular/fire/firestore';
import { from, Observable, map, of, switchMap } from 'rxjs';
import {
  User,
  Curso,
  Leccion,
  PreguntaExamen,
  IntentoExamen,
  KnowledgeTree
} from '../interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class Api {
  private usersCollection = 'users';
  private cursosCollection = 'cursos';
  private leccionesCollection = 'lecciones';
  private preguntasCollection = 'preguntas';
  private resultadosCollection = 'resultados';
  private arbolesCollection = 'arboles';

  constructor(@Inject(Firestore) private firestore: Firestore) {}

  // --------------------------
  // Usuarios
  // --------------------------
  crearUsuario(newUsuario: Omit<User, 'id'>, uid: string): Observable<User> {
    const userDoc = doc(this.firestore, this.usersCollection, uid);
    return from(setDoc(userDoc, { ...newUsuario, id: uid })).pipe(map(() => ({ ...newUsuario, id: uid })));
  }

  actualizarUsuario(id: string, datos: Partial<User>): Observable<void> {
    if (!id) return of();
    const userDoc = doc(this.firestore, this.usersCollection, id);
    return from(updateDoc(userDoc, datos));
  }

  /**
   * Devuelve el documento /users/{uid} (no lista la colección).
   * Retorna Promise<User|null> para evitar listar usuarios (reglas).
   */
  async getUserFullDataOnce(uid: string): Promise<User | null> {
    if (!uid) return null;
    try {
      const userRef = doc(this.firestore, `${this.usersCollection}/${uid}`);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return null;
      return { ...(snap.data() as any), id: uid } as User;
    } catch (err) {
      console.error('getUserFullDataOnce error:', err);
      throw err;
    }
  }

  // --------------------------
  // Cursos
  // --------------------------
  getAllCursos(): Observable<Curso[]> {
    return collectionData(collection(this.firestore, this.cursosCollection), { idField: 'id' }) as Observable<Curso[]>;
  }
  crearCurso(newCurso: Omit<Curso, 'id'>): Observable<Curso> {
    const ref = collection(this.firestore, this.cursosCollection);
    return from(addDoc(ref, newCurso)).pipe(map(docRef => ({ ...newCurso, id: docRef.id })));
  }

  // --------------------------
  // Lecciones
  // --------------------------
  getLeccionesByCurso(cursoId: string | number): Observable<Leccion[]> {
    return collectionData(collection(this.firestore, this.leccionesCollection), { idField: 'id' }).pipe(
      map((lecciones: any[]) => lecciones.filter(l => l.cursoId?.toString() === cursoId.toString()))
    );
  }
  crearLeccion(newLeccion: Omit<Leccion, 'id'>): Observable<Leccion> {
    const ref = collection(this.firestore, this.leccionesCollection);
    return from(addDoc(ref, newLeccion)).pipe(map(docRef => ({ ...newLeccion, id: docRef.id })));
  }

  // --------------------------
  // Preguntas
  // --------------------------
  getPreguntas(treeId?: string | number): Observable<PreguntaExamen[]> {
    return collectionData(collection(this.firestore, this.preguntasCollection), { idField: 'id' }).pipe(
      map((pregs: any[]) => treeId ? pregs.filter(p => p.treeId?.toString() === treeId.toString()) : pregs)
    );
  }

  // --------------------------
  // Resultados / intentos
  // --------------------------
  guardarIntento(usuarioId: string, respuestas: any[], score: number): Observable<IntentoExamen> {
    const intento: IntentoExamen = { usuarioId, fecha: new Date().toISOString(), respuestas, puntaje: score };
    return from(addDoc(collection(this.firestore, this.resultadosCollection), intento)).pipe(map(() => intento));
  }

  /**
   * Obtiene intentos/resultados filtrados por usuarioId (consulta server-side).
   * Retorna Observable para integrarse con firstValueFrom si lo deseas.
   */
  getIntentosByUsuario(uid: string): Observable<IntentoExamen[]> {
    if (!uid) return of([]);
    const col = collection(this.firestore, this.resultadosCollection);
    const q = query(col, where('usuarioId', '==', uid));
    return collectionData(q, { idField: 'id' }).pipe(
      map((arr: any[]) => arr.map(a => ({ ...(a as any), id: a.id }) as IntentoExamen))
    );
  }

  // Legacy: método usado anteriormente que lista TODO y filtra cliente-side (no recomendado).
  getIntentos(usuarioId: string): Observable<IntentoExamen[]> {
    return collectionData(collection(this.firestore, this.resultadosCollection), { idField: 'id' }).pipe(
      map((res: any[]) => res.filter(r => r.usuarioId === usuarioId))
    );
  }

  // --------------------------
  // Árboles
  // --------------------------
  getArboles(): Observable<KnowledgeTree[]> {
    return collectionData(collection(this.firestore, this.arbolesCollection), { idField: 'id' }).pipe(
      map((trees: any[]) => trees as KnowledgeTree[])
    );
  }

  getAllTrees(): Observable<KnowledgeTree[]> {
  return collectionData(collection(this.firestore, this.arbolesCollection), { idField: 'id' }) as Observable<KnowledgeTree[]>;
}

actualizarProgresoCurso(userId: string, treeId: string, lessonId: number): Observable<void> {
    const userDoc = doc(this.firestore, this.usersCollection, userId);
    return from(getDoc(userDoc)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) {
          throw new Error('Usuario no encontrado');
        }
        const userData = snapshot.data() as User;
        const learningProgress = userData.learningProgress || {};

        if (!learningProgress[treeId]) {
          learningProgress[treeId] = [];
        }

        if (!learningProgress[treeId].includes(lessonId)) {
          learningProgress[treeId].push(lessonId);
        }

        return learningProgress;
      }),
      switchMap(updatedProgress => updateDoc(userDoc, { learningProgress: updatedProgress }))
    );
  }
}
