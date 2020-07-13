import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigComponent } from './config/config.component';
import { MenufinanceComponent } from './menufinance/menufinance.component';
import { OrdersComponent } from './orders/orders.component';
import { OrdersViewComponent } from './orders-view/orders-view.component';
import { RibComponent } from './rib/rib.component';
import { MaterialModule } from '../material/material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { RouterModule } from '@angular/router';
import { TemplatesModule } from '../templates/templates.module';
import { financeRoutes } from './finance.routing';



@NgModule({
  declarations: [
    ConfigComponent,
    MenufinanceComponent,
    OrdersComponent,
    OrdersViewComponent,
    RibComponent
  ],
  imports: [
    TemplatesModule,
    RouterModule.forRoot(financeRoutes),
    DataTablesModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PipesModule,
    MaterialModule
  ],
  exports:[
    ConfigComponent,
    MenufinanceComponent,
    OrdersComponent,
    OrdersViewComponent,
    RibComponent,
    RouterModule
  ]
})
export class FinanceModule { }
