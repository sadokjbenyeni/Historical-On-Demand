import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowErrorsComponent } from './show-error/show-errors.component';
import { NgbdModalContent } from './modal-content/modal-content';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ShowErrorsComponent,
    NgbdModalContent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  entryComponents: [
    NgbdModalContent
  ],

  exports: [
    ShowErrorsComponent,
    NgbdModalContent
  ]
})
export class SharedModule { }
