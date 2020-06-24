import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingComponent } from './billing/billing.component';
import { CaddiesComponent } from './caddies/caddies.component';
import { CaddyTableComponent } from './caddy-table/caddy-table.component';
import { PriceComponent } from './price/price.component';
import { SurveyComponent } from './survey/survey.component';
import { MaterialModule } from '../material/material.module';
import { MenuModule } from '../menu/menu.module';
import { PaymentComponent } from './payment/payment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OrderModule } from '../order/order.module';



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
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    MenuModule,
    OrderModule,
  ],
  exports: [
    BillingComponent,
    CaddiesComponent,
    CaddyTableComponent,
    PaymentComponent,
    PriceComponent,
    SurveyComponent

  ]
})
export class CaddyModule { }
