import { Routes } from "@angular/router";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";

export const loginRoutes: Routes = [
    { path: "resetPassword/:token", component: ResetPasswordComponent }
]