import { Routes } from "@angular/router";
import { GuardGuard } from "../../guard/guard.guard";
import { OrderspViewComponent } from "./orders-view/ordersp-view.component";
import { OrderspComponent } from "./orders/ordersp.component";
import { ConfigpComponent } from "./config/configp.component";

export const productRoutes: Routes = [
    { path: 'product/config', component: ConfigpComponent, canActivate: [GuardGuard] },
    { path: 'product/orders', component: OrderspComponent, canActivate: [GuardGuard] },
    { path: 'product/orderview/:id', component: OrderspViewComponent, canActivate: [GuardGuard] }
]