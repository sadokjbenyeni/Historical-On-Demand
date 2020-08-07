import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginInformationsComponent } from './login-informations/login-informations.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { loginRoutes } from './login.routing';
import { RegisterComponent } from './register/register.component';
import { TemplatesModule } from '../templates/templates.module';
import { SharedModule } from '../../shared/shared.module';
import { RecaptchaModule } from 'ng-recaptcha';
import { ResetPasswordComponent } from './reset-password/reset-password.component';




@NgModule({
  declarations: [LoginInformationsComponent, RegisterComponent, ResetPasswordComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TemplatesModule,
    SharedModule,
    RecaptchaModule.forRoot(),
    RouterModule.forRoot(loginRoutes)
    ],
  exports: [
    LoginInformationsComponent,
    RouterModule
  ],
  entryComponents: []
})
export class LoginModule { }
