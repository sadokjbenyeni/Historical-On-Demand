import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TemplatesModule } from '../templates/templates.module';
import { LoginComponent } from '../account/login/login.component';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RecaptchaModule } from 'ng-recaptcha';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ValidatorsModule } from '../../validators/validators.module';
import { accountRoutes } from './account.routing';
import { AccountComponent } from './account/account.component';
import { AccountSideBarComponent } from './account-side-bar/account-side-bar.component';
import { LoginModule } from '../login/login.module';
import { ConfirmEmailUpdateComponent } from './confirm-email-update/confirm-email-update.component';



@NgModule({
  declarations: [
    LoginComponent,
    AccountComponent,
    AccountSideBarComponent,
    ConfirmEmailUpdateComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    BrowserModule,
    NgbModule,
    RouterModule.forRoot(accountRoutes),
    RecaptchaModule.forRoot(),
    PdfViewerModule,
    CommonModule,
    BrowserAnimationsModule,
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
