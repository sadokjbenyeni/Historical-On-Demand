import { Component, OnInit, Input, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { AuthentificationService } from '../../../services/authentification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  link: any = "";
  role: string[] = new Array<string>();
  private authSubscription : Subscription;
  constructor(
    private router: Router,
    private authService: AuthentificationService
  ) {

  }

  ngOnDestroy(): void {
    if(this.authSubscription){
      this.authSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.authSubscription = this.authService.subscribe(event => this.onAuthEventEmitted(event))
    // this.logoutEvent.subscribe(event => this.logout());
    this.role = this.authService.getRoles();
  }

  logout() {
    this.authService.logout().subscribe(() => { });
  }

  onAuthEventEmitted(eventParameters) {
    this.role = this.authService.getRoles();
    // if (eventParameters && eventParameters.event === 'logout') {
      // this.role = "";
      // this.router.navigated = false;
      // this.router.navigate(['/home']);
    // }
  }
}
