import { Routes } from '@angular/router';
import { RegisterComponent } from "./register/register.component";
import { GuardGuard } from "../../guard/guard.guard";
import { LoginComponent } from "./login/login.component";
import { AccountComponent } from './account/account.component';

export const accountRoutes: Routes = [
    { path: 'account', component: AccountComponent, canActivate: [GuardGuard] },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'activation/:token', component: LoginComponent },
    { path: 'mdp/:token', component: LoginComponent }
];
