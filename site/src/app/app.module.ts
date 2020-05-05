import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/authentification/token.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routes } from './app.routing';
// Guard
import { GuardGuard } from './guard.guard';

// Validate Form
import { ShowErrorsComponent } from './show-errors.component';
import { EmailValidatorDirective } from './validators/email-validator.directive';
import { EqualValidatorDirective } from './validators/equal-validator.directive';
import { TelephoneValidatorDirective } from './validators/telephone-validator.directive';
import { MdpValidatorDirective } from './validators/mdp-validator.directive';

// Components
// All
import { MenuComponent } from './components/menu/menu.component';
// Clients
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SearchComponent } from './components/search/search.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { AboutComponent } from './components/about/about.component';
import { HelpPageComponent } from './components/help-page/help-page.component';
import { OrderComponent } from './components/order/order.component';
import { SurveyComponent } from './components/survey/survey.component';
import { StatementsComponent } from './components/statements/statements.component';
import { CaddiesComponent } from './components/order/caddies/caddies.component';
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
// Services
import { DataService } from './data.service';
import { VatService } from './services/vat.service';
import { PaymentService } from './services/payment.service';
import { FluxService } from './services/flux.service';
import { CurrencyService } from './services/currency.service';
import { ElasticService } from './services/elastic.service';
import { UploadService } from './services/upload.service';
import { OrderService } from './services/order.service';
import { RoleService } from './services/role.service';
import { UserService } from './services/user.service';
import { CountriesService } from './services/countries.service';
import { CompanytypesService } from './services/companytypes.service';
import { FinanceService } from './services/finance.service';
import { ComplianceService } from './services/compliance.service';
import { ProductService } from './services/product.service';
import { ConfigService } from './services/config.service';
import { PdfService } from './services/pdf.service';

// Commun
import { ComCountriesComponent } from './components/commun/com-countries/com-countries.component';
import { AlertModule } from './_alert';
// Pipe
import { CeilPipe } from './ceil.pipe';
import { SafeHtmlPipePipe } from './safe-html-pipe.pipe';

// Middleware
import { RecaptchaModule } from 'ng-recaptcha';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalContent } from './modal-content';
import { PdfViewerModule } from 'ng2-pdf-viewer';
// import { PdfComponent } from './components/commun/pdf/pdf.component';
import { AdtvComponent } from './components/product/adtv/adtv.component';

import { CallbackPipe } from './callback.pipe';
import { ConfigElasticComponent } from './components/admin/config-elastic/config-elastic.component';
import { PurchaseTypePipe } from './purchaseType.pipe';
import { DateValidatorDirective } from './validators/date-validator.directive';
import { SalesService } from './services/sales.service';
import { MenusupportComponent } from './components/support/menusupport/menusupport.component';

// lazy loading


@NgModule({
  declarations: [
    AppComponent,
    VatComponent,
    LoginComponent,
    RegisterComponent,
    MenuComponent,
    HomeComponent,
    SearchComponent,
    UsersComponent,
    UserDetailComponent,
    UsersListComponent,
    ShowErrorsComponent,
    EmailValidatorDirective,
    EqualValidatorDirective,
    TelephoneValidatorDirective,
    MdpValidatorDirective,
    DateValidatorDirective,
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
    OrderComponent,
    SurveyComponent,
    StatementsComponent,
    CeilPipe,
    CaddiesComponent,
    PurchaseTypePipe,
    SafeHtmlPipePipe,
    NgbdModalContent,
    RibComponent,
    ComCountriesComponent,
    DownloadSettingComponent,
    PaymentsComponent,
    // PdfComponent,
    AdtvComponent,
    CallbackPipe,
    ClientOrderComponent,
    ClientOrderDetailsComponent,
    ConfigElasticComponent,
    MailFailedComponent,
    MenusupportComponent
  ],
  entryComponents: [NgbdModalContent],
  imports: [
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
  ],
  providers: [
    GuardGuard,
    ConfigService,
    PdfService,
    DataService,
    VatService,
    PaymentService,
    FluxService,
    CurrencyService,
    ElasticService,
    OrderService,
    UploadService,
    RoleService,
    UserService,
    CountriesService,
    FinanceService,
    ComplianceService,
    ProductService,
    CompanytypesService,
    SalesService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
