import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl, ValidationErrors } from '@angular/forms';


@Directive({
  selector: '[emailString]',
  providers: [{provide: NG_VALIDATORS, useExisting: EmailValidatorDirective, multi: true}]
})

export class EmailValidatorDirective implements Validator {

  validate(c: FormControl): ValidationErrors {
    if (c.value !== '') {
        const isEmail = /^(([^<>()\[\]\\.,;$#:\s@"]+(\.[^<>()\[\]\\.,;$#:\s@"]+)*)|(".+")){3,}@[a-zA-Z-_\.]{2,}\.[a-z]{2,4}$/.test(c.value);
        const message = {
        'emailString': {
            'message': 'Please enter a valid email'
          }
        };
        return isEmail ? null : message;
    } else {
        return null;
    }
  }
}
