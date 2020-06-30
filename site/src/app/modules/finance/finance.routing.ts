import { Routes } from "@angular/router";
import { GuardGuard } from "../../guard/guard.guard";
import { OrdersViewComponent } from "./orders-view/orders-view.component";
import { ConfigComponent } from "./config/config.component";
import { OrdersComponent } from "./orders/orders.component";

export const financeRoutes: Routes = [
  { path: 'finance/config', component: ConfigComponent, canActivate: [GuardGuard] },
  { path: 'finance/orders', component: OrdersComponent, canActivate: [GuardGuard] },
  { path: 'finance/orderview/:id', component: OrdersViewComponent, canActivate: [GuardGuard] }
]