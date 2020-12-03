import { environment } from '../../environments/environment';
import { User } from './user.model';
import { AuthResponse } from './auth.model';
import { Observable, throwError, Subject, BehaviorSubject } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  $isLoading = new Subject<boolean>();
  // API_KEY = 'AIzaSyCTmZKjHl5PkVZ8p8PKHeUF5X1mc9D_iPg';
  $user = new BehaviorSubject<User>(null);
  private tokenExpTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  autoLogin(): void {
    const userData: {
      id: string;
      email: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }
    const loadedUser = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );
    if (loadedUser.token) {
      this.$user.next(loadedUser);
      const expDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expDuration);
    }
  }

  autoLogout(expirationTimeout: number): void {
    this.tokenExpTimer = setTimeout(() => {
      this.logout();
    }, expirationTimeout);
  }

  login(
    email: string,
    pswd: string
  ): Observable<AuthResponse> | Observable<any> {
    return this.http
      .post<AuthResponse>(
        // `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.API_KEY}`,
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
        { email, password: pswd, returnSecureToken: true }
      )
      .pipe(
        tap(() => this.$isLoading.next(true)),
        delay(2000),
        tap((res: AuthResponse) => {
          this.handleAuth(res);
        }),
        catchError((err) => {
          this.$isLoading.next(false);
          return throwError(this.handleError(err));
        })
      );
  }

  logout(): void {
    this.$user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpTimer) {
      clearTimeout(this.tokenExpTimer);
    }
    this.tokenExpTimer = null;
  }

  signup(
    email: string,
    pswd: string
  ): Observable<AuthResponse> | Observable<any> {
    return this.http
      .post<AuthResponse>(
        // `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.API_KEY}`,
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
        {
          email,
          password: pswd,
          returnSecureToken: true,
        },
        {
          headers: {
            /* 'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'DELETE, POST, GET, OPTIONS',
            'Access-Control-Allow-Headers':
              'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With', */
          },
        }
      )
      .pipe(
        tap(() => this.$isLoading.next(true)),
        delay(2000),
        tap((res: AuthResponse) => {
          this.handleAuth(res);
        }),
        catchError((err) => {
          this.$isLoading.next(false);
          return throwError(this.handleError(err));
        })
      );
  }

  private handleAuth(res): void {
    const tokenExpirationDate = new Date(
      new Date().getTime() + +res.expiresIn * 1000
    );
    const user = new User(
      res.email,
      res.localId,
      res.idToken,
      tokenExpirationDate
    );
    this.$user.next(user);
    this.autoLogout(res.expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(err: HttpErrorResponse): Observable<HttpErrorResponse> {
    console.log(err);
    let error = err.error.error.message;
    if (error) {
      switch (error) {
        case 'EMAIL_EXISTS':
          error = 'This email already exists';
          break;
        case 'INVALID_PASSWORD':
          error =
            'The password is invalid or the user does not have a password.';
          break;
        case 'EMAIL_NOT_FOUND':
          error =
            'There is no user record corresponding to this identifier. The user may have been deleted';
          break;
        default:
          break;
      }
    }
    return error;
  }
}
