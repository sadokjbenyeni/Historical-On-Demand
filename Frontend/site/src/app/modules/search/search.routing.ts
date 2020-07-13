import { Routes } from "@angular/router";
import { GuardGuard } from "../../guard/guard.guard";
import { SearchComponent } from "./search/search.component";

export const searchRoutes: Routes = [
    { path: 'search', component: SearchComponent, canActivate: [GuardGuard] }
]
