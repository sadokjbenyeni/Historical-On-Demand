import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginInformationsComponent } from './login-informations/login-informations.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConfirmIdentityModalComponent } from './confirm-identity-modal/confirm-identity-modal.component';




@NgModule({
  declarations: [LoginInformationsComponent, ConfirmIdentityModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  exports: [
    LoginInformationsComponent
  ],
  entryComponents: [ConfirmIdentityModalComponent]
})
export class LoginModule { }
