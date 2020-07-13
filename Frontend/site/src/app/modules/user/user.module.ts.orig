import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInformationsComponent } from './user-informations/user-informations.component';
import { TemplatesModule } from '../templates/templates.module';
import { MaterialModule } from '../material/material.module';
import { userRoutes } from './user.routing';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdministrationModule } from '../administration/administration.module';



@NgModule({
  declarations: [UserInformationsComponent],
  imports: [
    CommonModule,
    TemplatesModule,
    MaterialModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
   // AdministrationModule,
    RouterModule.forRoot(userRoutes)
  ],
  exports:[
    RouterModule,
    UserInformationsComponent
  ]
})
export class UserModule { }
