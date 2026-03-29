import { Component, signal, inject, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavComponent } from './core/nav/nav.component';
import { AuthModalComponent } from './user/auth-modal/auth-modal.component';
import { AuthService } from './services/auth.service';
import { AsyncPipe } from '@angular/common';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, AuthModalComponent, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
  auth = inject(AuthService);
  private router = inject(Router);
  scrollTopSubscription = new Subscription();

  constructor() {
    this.scrollTopSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  ngOnDestroy() {
    this.scrollTopSubscription?.unsubscribe();
  }
}
