import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginInformationsComponent } from './login-informations/login-informations.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';




@NgModule({
  declarations: [LoginInformationsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
    ],
  exports: [
    LoginInformationsComponent
  ],
  entryComponents: []
})
export class LoginModule { }
