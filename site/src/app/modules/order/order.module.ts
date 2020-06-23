import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderAmountComponent } from './order-amount/order-amount.component';
import { MaterialModule } from '../material/material.module';
import { OrderInformationComponent } from './order-information/order-information.component';



@NgModule({
  declarations: [
    OrderAmountComponent, 
    OrderInformationComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    OrderAmountComponent,
    OrderInformationComponent
  ]
})
export class OrderModule { }
