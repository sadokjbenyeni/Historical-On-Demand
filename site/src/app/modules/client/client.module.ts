import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientInformationComponent } from './client-information/client-information.component';
import { MaterialModule } from '../material/material.module';
import { MenuModule } from '../menu/menu.module';
import { ClientInformation } from './models/client-information.model';



@NgModule({
  declarations: [
    ClientInformationComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MenuModule
  ],
  exports: [
    ClientInformationComponent
  ]
})
export class ClientModule { }
