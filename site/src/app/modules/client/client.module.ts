import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientInformationComponent } from './client-information/client-information.component';
import { MaterialModule } from '../material/material.module';
import { MenuModule } from '../menu/menu.module';



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
