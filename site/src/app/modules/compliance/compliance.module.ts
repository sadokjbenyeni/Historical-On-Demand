import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigcComponent } from './config/configc.component';
import { MenucomplianceComponent } from './menucompliance/menucompliance.component';
import { OrderscComponent } from './orders/ordersc.component';
import { OrderscViewComponent } from './orders-view/ordersc-view.component';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TemplatesModule } from '../templates/templates.module';
import { PipesModule } from '../../pipes/pipes.module';
import { complianceRoutes } from './compliance.routing';



@NgModule({
  declarations: [
    ConfigcComponent,
    MenucomplianceComponent,
    OrderscComponent,
    OrderscViewComponent

  ],
  imports: [
    TemplatesModule,
    RouterModule.forRoot(complianceRoutes),
    DataTablesModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PipesModule,
    MaterialModule
  ],
  exports: [
    ConfigcComponent,
    MenucomplianceComponent,
    OrderscComponent,
    OrderscViewComponent,
    RouterModule
  ]
})
export class ComplianceModule { }
