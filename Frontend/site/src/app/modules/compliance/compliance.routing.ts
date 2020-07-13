import { Routes } from "@angular/router";
import { GuardGuard } from "../../guard/guard.guard";
import { ConfigcComponent } from "./config/configc.component";
import { OrderscComponent } from "./orders/ordersc.component";
import { OrderscViewComponent } from "./orders-view/ordersc-view.component";
import { UsersComponent } from "../administration/users/users.component";

export const complianceRoutes: Routes = [
  { path: 'compliance/commandes', component: UsersComponent, canActivate: [GuardGuard] },
  { path: 'compliance/config', component: ConfigcComponent, canActivate: [GuardGuard] },
  { path: 'compliance/orders', component: OrderscComponent, canActivate: [GuardGuard] },
  { path: 'compliance/orderview/:id', component: OrderscViewComponent, canActivate: [GuardGuard] }
]
