import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, switchMap, throwError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User, Curso, Leccion } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class Api {
  constructor(private http: HttpClient) {}

  // ======================================================
  // ==== USUARIOS ====
  // ======================================================

  listarUsuarios(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/usuarios`);
  }

  /**
   * Crear un nuevo usuario con validación de username y email únicos.
   */
  CrearUsuario(newUsuario: User): Observable<User> {
    return this.listarUsuarios().pipe(
      switchMap((usuarios: User[]) => {
        const existeUsername = usuarios.some(
          (u) => u.username.toLowerCase() === newUsuario.username.toLowerCase()
        );
        const existeEmail = usuarios.some(
          (u) => u.email.toLowerCase() === newUsuario.email.toLowerCase()
        );

        if (existeUsername) {
          return throwError(() => new Error('El nombre de usuario ya existe'));
        }
        if (existeEmail) {
          return throwError(() => new Error('El correo electrónico ya está registrado'));
        }

        const maxId =
          usuarios.length > 0
            ? Math.max(
                ...usuarios.map((u) =>
                  typeof u.id === 'string' ? parseInt(u.id) || 0 : (u.id as number)
                )
              )
            : 0;
        const nuevoId = maxId + 1;

        const usuarioFinal: User = {
          ...newUsuario,
          id: nuevoId,
          isactive: true,
        };

        return this.http.post<User>(`${environment.apiUrl}/usuarios`, usuarioFinal);
      })
    );
  }

  /**
   * Obtener todos los usuarios
   */
  GetAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/usuarios`);
  }

  /**
   * Obtener usuario por username
   */
  GetUserByUsername(username: string): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/usuarios?username=${username}`);
  }

  /**
   * Nuevo método: Obtener usuario por username o email (para login flexible)
   */
/**
 * Obtener usuario por username o email (case-insensitive, filtrado client-side para evitar problemas de backend)
 */
  GetUserByUsernameOrEmail(valor: string) : Observable<User[]> {
    const q = (valor || '').trim().toLowerCase();
    if (!q) {
      return of([]);
    }

    return this.listarUsuarios().pipe(
      map((usuarios: User[]) => {
        return usuarios.filter(u => {
          const uName = (u.username || '').toString().trim().toLowerCase();
          const uEmail = (u as any).email ? (u as any).email.toString().trim().toLowerCase() : '';
          return uName === q || uEmail === q;
        });
      })
    );
  }


  /**
   * Verifica si hay sesión activa
   */
  IsLogged(): boolean {
    return sessionStorage.getItem('username') != null;
  }

  // ======================================================
  // ==== CURSOS Y LECCIONES ====
  // ======================================================

  GetAllCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${environment.apiUrl}/cursos`);
  }

  GetCursosByUsuario(username: string): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${environment.apiUrl}/cursos?usuario=${username}`);
  }

  GetLeccionesByCurso(cursoId: number): Observable<Leccion[]> {
    return this.http.get<Leccion[]>(`${environment.apiUrl}/lecciones?cursoId=${cursoId}`);
  }

  CrearCurso(newCurso: Curso): Observable<Curso> {
    return this.http.post<Curso>(`${environment.apiUrl}/cursos`, newCurso);
  }

  CrearLeccion(newLeccion: Leccion): Observable<Leccion> {
    return this.http.post<Leccion>(`${environment.apiUrl}/lecciones`, newLeccion);
  }

  // ======================================================
  // ==== PREGUNTAS Y RESULTADOS ====
  // ======================================================

  GetPreguntas(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/preguntas`);
  }

  GuardarResultado(username: string, puntaje: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/resultados`, {
      usuario: username,
      puntaje,
      fecha: new Date(),
    });
  }
}
