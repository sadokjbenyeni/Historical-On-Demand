import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowErrorsComponent } from './show-error/show-errors.component';
import { NgbdModalContent } from './modal-content/modal-content';
import { RouterModule } from '@angular/router';
import { BillingInformationsComponent } from './user/billing-informations/billing-informations.component';
import { MaterialModule } from '../modules/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactInformationsComponent } from './user/contact-informations/contact-informations.component';



@NgModule({
  declarations: [
    ShowErrorsComponent,
    NgbdModalContent,
    BillingInformationsComponent,
    ContactInformationsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  entryComponents: [
    NgbdModalContent
  ],

  exports: [
    ShowErrorsComponent,
    NgbdModalContent,
    BillingInformationsComponent,
    ContactInformationsComponent
  ]
})
export class SharedModule { }
