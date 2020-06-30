import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertModule } from '../_alert';
import { MaterialModule } from '../material/material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { RouterModule } from '@angular/router';
import { TemplatesModule } from '../templates/templates.module';
import { OrderspViewComponent } from './orders-view/ordersp-view.component';
import { VatComponent } from './vat/vat.component';
import { AdtvComponent } from './adtv/adtv.component';
import { ConfigpComponent } from './config/configp.component';
import { DownloadSettingComponent } from './download-setting/download-setting.component';
import { MailFailedComponent } from './mail-failed/mail-failed.component';
import { MenuproductComponent } from './menuproduct/menuproduct.component';
import { OrderspComponent } from './orders/ordersp.component';
import { PaymentsComponent } from './payments/payments.component';
import { productRoutes } from './product.routing';



@NgModule({
  declarations: [
    AdtvComponent,
    ConfigpComponent,
    DownloadSettingComponent,
    MailFailedComponent,
    MenuproductComponent,
    OrderspComponent,
    OrderspViewComponent,
    PaymentsComponent,
    VatComponent
  ],
  imports: [
    CommonModule,
    AlertModule,
    TemplatesModule,
    RouterModule.forRoot(productRoutes),
    DataTablesModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PipesModule,
    MaterialModule
  ],
  exports: [
    AdtvComponent,
    ConfigpComponent,
    DownloadSettingComponent,
    MailFailedComponent,
    MenuproductComponent,
    OrderspComponent,
    OrderspViewComponent,
    PaymentsComponent,
    VatComponent,
    RouterModule
  ]
})
export class ProductModule { }
