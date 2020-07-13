import { Routes } from "@angular/router";
import { UserDetailComponent } from "./user-detail/user-detail.component";
import { GuardGuard } from "../../guard/guard.guard";
import { UsersComponent } from "./users/users.component";
import { RoleComponent } from "./role/role.component";
import { CountriesComponent } from "./countries/countries.component";
import { TermsComponent } from "./terms/terms.component";
import { VariableComponent } from "./variable/variable.component";
import { HelpComponent } from "./help/help.component";

export const administrationRoutes: Routes = [
    { path: 'admin/profil/:id', component: UserDetailComponent, canActivate: [GuardGuard] },
    { path: 'admin/users', component: UsersComponent, canActivate: [GuardGuard] },
    { path: 'admin/role', component: RoleComponent, canActivate: [GuardGuard] },
    { path: 'admin/countries', component: CountriesComponent, canActivate: [GuardGuard] },
    // { path: 'admin/country/:id', component: CountryComponent, canActivate: [GuardGuard] },
    { path: 'admin/terms', component: TermsComponent, canActivate: [GuardGuard] },
    { path: 'admin/variable', component: VariableComponent, canActivate: [GuardGuard] },
    { path: 'admin/help', component: HelpComponent, canActivate: [GuardGuard] }
]
