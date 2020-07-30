import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginInformationsComponent } from './login-informations/login-informations.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { loginRoutes } from './login.routing';




@NgModule({
  declarations: [LoginInformationsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forRoot(loginRoutes)
    ],
  exports: [
    LoginInformationsComponent,
    RouterModule
  ],
  entryComponents: []
})
export class LoginModule { }
