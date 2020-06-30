import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientOrderComponent } from './client-order/client-order.component';
import { ClientOrderDetailsComponent } from './client-order-details/client-order-details.component';
import { MenusupportComponent } from './menusupport/menusupport.component';
import { TemplatesModule } from '../templates/templates.module';
import { RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { MaterialModule } from '../material/material.module';
import { ClientModule } from '../client/client.module';
import { OrderModule } from '../order/order.module';
import { supportRoutes } from './support.routing';



@NgModule({
  declarations: [
    ClientOrderComponent,
    ClientOrderDetailsComponent,
    MenusupportComponent

  ],
  imports: [
    CommonModule,
    TemplatesModule,
    RouterModule.forRoot(supportRoutes),
    DataTablesModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PipesModule,
    MaterialModule,
    ClientModule,
    OrderModule
  ],
  exports:[
    ClientOrderComponent,
    ClientOrderDetailsComponent,
    MenusupportComponent,
    RouterModule
  ]
})
export class SupportModule { }
