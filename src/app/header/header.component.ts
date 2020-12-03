import { takeUntil } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from './../auth/auth.service';
import { DataStorageService } from './../shared/data-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [],
})
export class HeaderComponent implements OnInit, OnDestroy {
  $userSub = new Subject();
  isAuthenticated = false;
  constructor(
    private dataStorageService: DataStorageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.$user.pipe(takeUntil(this.$userSub)).subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }
  onSaveData(): void {
    this.dataStorageService.storeRecipes();
  }

  onFetchData(): void {
    this.dataStorageService.loadRecipes().subscribe();
  }

  onLogOut(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.$userSub.next();
    this.$userSub.complete();
  }
}
