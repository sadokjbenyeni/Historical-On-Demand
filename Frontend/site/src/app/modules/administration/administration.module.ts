import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigElasticComponent } from './config-elastic/config-elastic.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { CountriesComponent } from './countries/countries.component';
import { HelpComponent } from './help/help.component';
import { RoleComponent } from './role/role.component';
import { TermsComponent } from './terms/terms.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UsersComponent } from './users/users.component';
import { VariableComponent } from './variable/variable.component';
import { ComCountriesComponent } from './com-countries/com-countries.component';
import { TemplatesModule } from '../templates/templates.module';
import { RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { administrationRoutes } from './administration.routing';
import { UserModule } from '../user/user.module';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { UserRolesComponent } from './user-roles/user-roles.component';



@NgModule({
  declarations: [
    ConfigElasticComponent,
    ConfigurationComponent,
    CountriesComponent,
    HelpComponent,
    RoleComponent,
    TermsComponent,
    UserDetailComponent,
    UsersComponent,
    VariableComponent,
    ComCountriesComponent,
    UserRolesComponent
  ],
  imports: [
    CommonModule,
    TemplatesModule,
    RouterModule.forRoot(administrationRoutes),
    DataTablesModule,
    UserModule,
    SharedModule,
    MaterialModule
  ],
  exports:[
    ConfigElasticComponent,
    ConfigurationComponent,
    CountriesComponent,
    HelpComponent,
    RoleComponent,
    TermsComponent,
    UserDetailComponent,
    UsersComponent,
    VariableComponent,
    ComCountriesComponent,
    RouterModule
  ]
})
export class AdministrationModule { }
