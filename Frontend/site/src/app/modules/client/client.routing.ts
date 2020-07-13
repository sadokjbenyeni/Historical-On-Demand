import { Routes } from "@angular/router";
import { GuardGuard } from "../../guard/guard.guard";
import { OrderHistoryDetailsComponent } from "./order-history-details/order-history-details.component";
import { OrderHistoryComponent } from "./order-history/order-history.component";

export const clientRoutes: Routes = [
    { path: 'order/history', component: OrderHistoryComponent, canActivate: [GuardGuard] },
    { path: 'order/history/:id', component: OrderHistoryDetailsComponent, canActivate: [GuardGuard] }
]
