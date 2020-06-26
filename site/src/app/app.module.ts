import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
//import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routes } from './app.routing';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FileSelectDirective } from 'ng2-file-upload';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

// Guard
import { GuardGuard } from './guard/guard.guard';

// Validate Form
import { EqualValidatorDirective } from './validators/equal-validator.directive';
// Components
// Clients
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SearchComponent } from './components/search/search.component';
import { OrderHistoryComponent } from './components/client/order-history/order-history.component';
import { AboutComponent } from './components/about/about.component';
import { HelpPageComponent } from './components/help-page/help-page.component';
import { StatementsComponent } from './components/statements/statements.component';
// Administrators
import { ConfigurationComponent } from './components/admin/configuration/configuration.component';
import { VariableComponent } from './components/admin/variable/variable.component';
import { RoleComponent } from './components/admin/role/role.component';
import { CountriesComponent } from './components/admin/countries/countries.component';
import { CountryComponent } from './components/admin/country/country.component';
import { TermsComponent } from './components/admin/terms/terms.component';
import { HelpComponent } from './components/admin/help/help.component';
import { UsersComponent } from './components/admin/users/users.component';
import { UserDetailComponent } from './components/admin/user-detail/user-detail.component';
import { UsersListComponent } from './components/admin/users-list/users-list.component';
// Products
import { MenuproductComponent } from './components/product/menuproduct/menuproduct.component';
import { ConfigpComponent } from './components/product/config/configp.component';
import { VatComponent } from './components/product/vat/vat.component';
import { OrderspComponent } from './components/product/orders/ordersp.component';
import { OrderspViewComponent } from './components/product/orders-view/ordersp-view.component';
import { RibComponent } from './components/finance/rib/rib.component';
import { DownloadSettingComponent } from './components/product/download-setting/download-setting.component';
import { PaymentsComponent } from './components/product/payments/payments.component';
import { MailFailedComponent } from './components/product/mail-failed/mail-failed.component';
// Compliances
import { MenucomplianceComponent } from './components/compliance/menucompliance/menucompliance.component';
import { ConfigcComponent } from './components/compliance/config/configc.component';
import { OrderscComponent } from './components/compliance/orders/ordersc.component';
import { OrderscViewComponent } from './components/compliance/orders-view/ordersc-view.component';
// Finances
import { MenufinanceComponent } from './components/finance/menufinance/menufinance.component';
import { ConfigComponent } from './components/finance/config/config.component';
import { OrdersComponent } from './components/finance/orders/orders.component';
import { OrdersViewComponent } from './components/finance/orders-view/orders-view.component';
// Support
import { ClientOrderComponent } from './components/support/client-order/client-order.component';
import { ClientOrderDetailsComponent } from './components/support/client-order-details/client-order-details.component';


// Commun
import { ComCountriesComponent } from './components/commun/com-countries/com-countries.component';
import { AlertModule } from './_alert';

// Middleware
import { RecaptchaModule } from 'ng-recaptcha';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalContent } from './shared/modal-content';
import { PdfViewerModule } from 'ng2-pdf-viewer';
// import { PdfComponent } from './components/commun/pdf/pdf.component';
import { AdtvComponent } from './components/product/adtv/adtv.component';

import { ConfigElasticComponent } from './components/admin/config-elastic/config-elastic.component';
import { MenusupportComponent } from './components/support/menusupport/menusupport.component';
import { CommonModule } from '@angular/common';
import { OrderHistoryDetailsComponent } from './components/client/order-history-details/order-history-details.component';
import { CancelOrderDialogComponent } from './components/client/cancel-order-dialog/cancel-order-dialog.component';
import { TokenInterceptor } from './interceptors/authentification/token.interceptor';
import { MaterialModule } from './modules/material/material.module';
import { ClientModule } from './modules/client/client.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrderModule } from './modules/order/order.module';
import { CaddyModule } from './modules/caddy/caddy.module';
import { PipesModule } from './pipes/pipes.module';
// lazy loading

@NgModule({
  declarations: [
    AppComponent,
    VatComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    SearchComponent,
    UsersComponent,
    UserDetailComponent,
    UsersListComponent,
    EqualValidatorDirective,
    ConfigurationComponent,
    VariableComponent,
    RoleComponent,
    CountriesComponent,
    TermsComponent,
    HelpComponent,
    CountryComponent,
    MenuproductComponent,
    ConfigpComponent,
    OrderspComponent,
    OrderspViewComponent,
    MenucomplianceComponent,
    ConfigcComponent,
    OrderscComponent,
    OrderscViewComponent,
    MenufinanceComponent,
    ConfigComponent,
    OrdersComponent,
    OrdersViewComponent,
    OrderHistoryComponent,
    AboutComponent,
    HelpPageComponent,
    StatementsComponent,
    NgbdModalContent,
    RibComponent,
    ComCountriesComponent,
    DownloadSettingComponent,
    PaymentsComponent,
    // PdfComponent,
    AdtvComponent,
    ClientOrderComponent,
    ClientOrderDetailsComponent,
    ConfigElasticComponent,
    MailFailedComponent,
    MenusupportComponent,
    OrderHistoryDetailsComponent,
    CancelOrderDialogComponent,
    FileSelectDirective,

  ],
  entryComponents: [NgbdModalContent],
  imports: [
    CaddyModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    DataTablesModule,
    NgbModule,
    RecaptchaModule.forRoot(),
    PdfViewerModule,
    AlertModule,
    CommonModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    MaterialModule,
    ClientModule,
    MenuModule,
    OrderModule,
    PipesModule
    // NgbModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
