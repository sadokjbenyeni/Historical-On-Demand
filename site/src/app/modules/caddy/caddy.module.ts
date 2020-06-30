import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingComponent } from './billing/billing.component';
import { CaddiesComponent } from './caddies/caddies.component';
import { CaddyTableComponent } from './caddy-table/caddy-table.component';
import { PriceComponent } from './price/price.component';
import { SurveyComponent } from './survey/survey.component';
import { MaterialModule } from '../material/material.module';
import { TemplatesModule } from '../templates/templates.module';
import { PaymentComponent } from './payment/payment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OrderModule } from '../order/order.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from '../../shared/shared.module';
import { caddyRoutes } from './caddy.routing';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    BillingComponent,
    CaddiesComponent,
    CaddyTableComponent,
    PaymentComponent,
    PriceComponent,
    SurveyComponent
  ],
  imports: [
    PdfViewerModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    TemplatesModule,
    OrderModule,
    SharedModule,
    RouterModule.forRoot(caddyRoutes)
  ],
  exports: [
    BillingComponent,
    CaddiesComponent,
    CaddyTableComponent,
    PaymentComponent,
    PriceComponent,
    SurveyComponent,
    RouterModule
  ]
})
export class CaddyModule { }
