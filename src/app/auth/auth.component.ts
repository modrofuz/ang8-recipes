import {
  Component,
  ComponentFactoryResolver,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, take } from 'rxjs/operators';
import { AlertComponent } from './../shared/alert/alert.component';
import { PlaceHolderDirective } from './../shared/placeholder/placeholder.directive';
import { AuthResponse } from './auth.model';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: [],
})
export class AuthComponent implements OnInit {
  @ViewChild(PlaceHolderDirective, { static: false })
  alertHost: PlaceHolderDirective;
  isLoginMode = true;
  authForm: FormGroup;
  $isLoading: Observable<boolean>;
  error: string = null;
  $authObs: Observable<AuthResponse>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    this.authService.$isLoading
      .pipe(tap((isLoading) => (this.$isLoading = of(isLoading))))
      .subscribe();
    this.authForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  onCloseAlert(): void {
    this.error = null;
  }

  onSwitchMode(): void {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      return;
    }
    if (this.isLoginMode) {
      this.$authObs = this.authService.login(
        this.authForm.value.email,
        this.authForm.value.password
      );
    } else {
      this.$authObs = this.authService.signup(
        this.authForm.value.email,
        this.authForm.value.password
      );
    }

    this.$authObs.subscribe(
      (resData) => {
        console.log(resData);
        this.router.navigate(['./recipes']);
      },
      (err) => {
        this.error = err;
        this.showAlert(err);
      },
      () => {
        this.authService.$isLoading.next(false);
        this.error = null;
      }
    );

    this.authForm.reset();
  }

  private showAlert(error: string): void {
    const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(
      AlertComponent
    );
    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();
    const componentRef = hostViewContainerRef.createComponent(alertCmpFactory);
    componentRef.instance.message = error;
    componentRef.instance.closeAlert.pipe(take(1)).subscribe(() => {
      hostViewContainerRef.clear();
    });
  }
}
