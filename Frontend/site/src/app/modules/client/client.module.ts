import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientInformationComponent } from './client-information/client-information.component';
import { MaterialModule } from '../material/material.module';
import { TemplatesModule } from '../templates/templates.module';
import { RouterModule } from '@angular/router';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { OrderHistoryDetailsComponent } from './order-history-details/order-history-details.component';
import { OrderModule } from '../order/order.module';
import { PipesModule } from '../../pipes/pipes.module';
import { clientRoutes } from './client.routing';



@NgModule({
  declarations: [
    ClientInformationComponent,
    OrderHistoryComponent,
    OrderHistoryDetailsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    TemplatesModule,
    RouterModule.forRoot(clientRoutes),
    OrderModule,
    PipesModule
  ],
  exports: [
    ClientInformationComponent,
    OrderHistoryComponent,
    OrderHistoryDetailsComponent,
    RouterModule
  ]
})
export class ClientModule { }
