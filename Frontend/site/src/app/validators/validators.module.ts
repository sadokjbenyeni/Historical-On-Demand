import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EqualValidatorDirective } from './equal-validator.directive';
import { EmailValidatorDirective } from './email-validator.directive';



@NgModule({
  declarations: [
    EmailValidatorDirective,
    EqualValidatorDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EmailValidatorDirective,
    EqualValidatorDirective
  ]
})
export class ValidatorsModule { }
