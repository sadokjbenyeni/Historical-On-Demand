import { Routes } from "@angular/router";
import { GuardGuard } from "../../guard/guard.guard";
import { ClientOrderDetailsComponent } from "./client-order-details/client-order-details.component";
import { ClientOrderComponent } from "./client-order/client-order.component";

export const supportRoutes: Routes= [
    { path: 'support/clientorder', component: ClientOrderComponent, canActivate: [GuardGuard] },
    { path: 'support/clientorder/:id', component: ClientOrderDetailsComponent, canActivate: [GuardGuard] }
]
