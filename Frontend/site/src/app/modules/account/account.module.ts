import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TemplatesModule } from '../templates/templates.module';
import { LoginComponent } from '../account/login/login.component';
import { RegisterComponent } from '../account/register/register.component';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RecaptchaModule } from 'ng-recaptcha';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AlertModule } from '../_alert';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ValidatorsModule } from '../../validators/validators.module';
import { accountRoutes } from './account.routing';
import { AccountComponent } from './account/account.component';
import { AccountSideBarComponent } from './account-side-bar/account-side-bar.component';
import { LoginModule } from '../login/login.module';



@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    AccountComponent,
    AccountSideBarComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    NgbModule,
    RouterModule.forRoot(accountRoutes),
    RecaptchaModule.forRoot(),
    PdfViewerModule,
    AlertModule,
    CommonModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    TemplatesModule,
    SharedModule,
    ValidatorsModule,
    MaterialModule,
    LoginModule
  ],
  exports: [
    RouterModule
  ]
})
export class AccountModule { }
