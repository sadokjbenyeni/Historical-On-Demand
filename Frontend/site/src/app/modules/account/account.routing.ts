import { Routes } from '@angular/router';
import { RegisterComponent } from "./register/register.component";
import { GuardGuard } from "../../guard/guard.guard";
import { LoginComponent } from "./login/login.component";
import { AccountComponent } from './account/account.component';
import { ConfirmEmailUpdateComponent } from './confirm-email-update/confirm-email-update.component';
import { ConfirmPasswordUpdateComponent } from './confirm-password-update/confirm-password-update.component';

export const accountRoutes: Routes = [
    { path: 'account', component: AccountComponent, canActivate: [GuardGuard] },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'activation/:token', component: LoginComponent },
    { path: 'mdp/:token', component: LoginComponent },
    { path: 'user/confirmEmailUpdate/:token', component: ConfirmEmailUpdateComponent },
    { path: 'user/confirmPasswordUpdate/:token', component: ConfirmPasswordUpdateComponent }
];
