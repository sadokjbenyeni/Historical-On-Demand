import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routes } from './app.routing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FileSelectDirective } from 'ng2-file-upload';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { TokenInterceptor } from './interceptors/authentification/token.interceptor';

//Modules
import { MaterialModule } from './modules/material/material.module';
import { ClientModule } from './modules/client/client.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { OrderModule } from './modules/order/order.module';
import { CaddyModule } from './modules/caddy/caddy.module';
import { SearchModule } from './modules/search/search.module';
import { AccountModule } from './modules/account/account.module';
import { AdministrationModule } from './modules/administration/administration.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ProductModule } from './modules/product/product.module';
import { SupportModule } from './modules/support/support.module';

@NgModule({
  declarations: [
    AppComponent,
    FileSelectDirective
  ],
  imports: [
    CaddyModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    CommonModule,
    BrowserAnimationsModule,
    ClientModule,
    TemplatesModule,
    OrderModule,
    AccountModule,
    AdministrationModule,
    SearchModule,
    MaterialModule,
    ComplianceModule,
    FinanceModule,
    ProductModule,
    SupportModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
