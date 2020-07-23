import { Routes } from '@angular/router';

// Guards
import { GuardGuard } from './guard.guard';

// Site Admins
import { UsersComponent } from './components/admin/users/users.component';
import { UserDetailComponent } from './components/admin/user-detail/user-detail.component';
import { ClientOrderComponent } from './components/admin/client-order/client-order.component';
import { ClientOrderDetailsComponent } from './components/admin/client-order-details/client-order-details.component';
import { RoleComponent } from './components/admin/role/role.component';
import { CountriesComponent } from './components/admin/countries/countries.component';
import { CountryComponent } from './components/admin/country/country.component';
import { TermsComponent } from './components/admin/terms/terms.component';
import { VariableComponent } from './components/admin/variable/variable.component';
import { HelpComponent } from './components/admin/help/help.component';

// Site Products
import { ConfigpComponent } from './components/product/config/configp.component';
import { OrderspComponent } from './components/product/orders/ordersp.component';
import { OrderspViewComponent } from './components/product/orders-view/ordersp-view.component';

// Site Compliances
import { ConfigcComponent } from './components/compliance/config/configc.component';
import { OrderscComponent } from './components/compliance/orders/ordersc.component';
import { OrderscViewComponent } from './components/compliance/orders-view/ordersc-view.component';

// Site Finances
import { ConfigComponent } from './components/finance/config/config.component';
import { OrdersComponent } from './components/finance/orders/orders.component';
import { OrdersViewComponent } from './components/finance/orders-view/orders-view.component';

// Site Clients
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { HelpPageComponent } from './components/help-page/help-page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SearchComponent } from './components/search/search.component';
import { OrderComponent } from './components/order/order.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { CaddiesComponent } from './components/order/caddies/caddies.component';
import { SurveyComponent } from './components/survey/survey.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch : 'full' },
  // CLIENT
  { path: 'account', component : RegisterComponent, canActivate: [GuardGuard] },
  { path: 'search', component : SearchComponent, canActivate: [GuardGuard] },
  { path: 'order/history', component : OrderHistoryComponent, canActivate: [GuardGuard] },
  { path: 'order/caddies', component : CaddiesComponent, canActivate: [GuardGuard] },
  { path: 'order/review', component : CaddiesComponent, canActivate: [GuardGuard] },
  { path: 'order/licensing', component : CaddiesComponent, canActivate: [GuardGuard] },
  { path: 'order/payment', component : CaddiesComponent, canActivate: [GuardGuard] },
  { path: 'order/survey', component : SurveyComponent, canActivate: [GuardGuard] },
  { path: 'order/billing', component : CaddiesComponent, canActivate: [GuardGuard] },
  { path: 'order/orderconfirm', component : CaddiesComponent, canActivate: [GuardGuard] },
  // ADMINISTRATOR
  { path: 'admin/profil/:id', component : UserDetailComponent, canActivate: [GuardGuard] },
  { path: 'admin/users', component : UsersComponent, canActivate: [GuardGuard] },
  { path: 'admin/clientorder', component : ClientOrderComponent, canActivate: [GuardGuard] },
  { path: 'admin/clientorderdetails/:id', component : ClientOrderDetailsComponent, canActivate: [GuardGuard] },
  { path: 'admin/role', component : RoleComponent, canActivate: [GuardGuard] },
  { path: 'admin/countries', component : CountriesComponent, canActivate: [GuardGuard] },
  { path: 'admin/country/:id', component : CountryComponent, canActivate: [GuardGuard] },
  { path: 'admin/terms', component : TermsComponent, canActivate: [GuardGuard] },
  { path: 'admin/variable', component : VariableComponent, canActivate: [GuardGuard] },
  { path: 'admin/help', component : HelpComponent, canActivate: [GuardGuard] },
  // COMPLIANCE
  // { path: 'compliance/commandes', component : UsersComponent, canActivate: [GuardGuard] },
  { path: 'compliance/config', component : ConfigcComponent, canActivate: [GuardGuard] },
  { path: 'compliance/orders', component : OrderscComponent, canActivate: [GuardGuard] },
  { path: 'compliance/orderview/:id', component : OrderscViewComponent, canActivate: [GuardGuard] },
  // FINANCE
  { path: 'finance/config', component : ConfigComponent, canActivate: [GuardGuard] },
  { path: 'finance/orders', component : OrdersComponent, canActivate: [GuardGuard] },
  { path: 'finance/orderview/:id', component : OrdersViewComponent, canActivate: [GuardGuard] },
  // PRODUCT
  { path: 'product/config', component : ConfigpComponent, canActivate: [GuardGuard] },
  { path: 'product/orders', component : OrderspComponent, canActivate: [GuardGuard] },
  { path: 'product/orderview/:id', component : OrderspViewComponent, canActivate: [GuardGuard] },
  // ALL USERS
  { path: 'home', component : HomeComponent },
  { path: 'about', component : AboutComponent },
  { path: 'help', component : HelpPageComponent },
  { path: 'register', component : RegisterComponent },
  { path: 'login', component : LoginComponent },
  { path: 'activation/:token', component : LoginComponent },
  { path: 'mdp/:token', component : LoginComponent },
  { path: '**', component: HomeComponent }
];
