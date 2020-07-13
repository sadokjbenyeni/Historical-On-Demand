import { Routes } from "@angular/router";
import { GuardGuard } from "../../guard/guard.guard";
import { CaddiesComponent } from "./caddies/caddies.component";

export const caddyRoutes: Routes = [
    { path: 'order/caddies', component: CaddiesComponent, canActivate: [GuardGuard] }

]
