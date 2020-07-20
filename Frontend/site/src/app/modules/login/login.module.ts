import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginInformationsComponent } from './login-informations/login-informations.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConfirmIdentityModalComponent } from './confirm-identity-modal/confirm-identity-modal.component';
import { ClickOutsideModule } from 'ng-click-outside';




@NgModule({
  declarations: [LoginInformationsComponent, ConfirmIdentityModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ClickOutsideModule
  ],
  exports: [
    LoginInformationsComponent
  ],
  entryComponents: [ConfirmIdentityModalComponent]
})
export class LoginModule { }
