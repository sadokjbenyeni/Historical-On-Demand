import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class BurgerMenuService {

  constructor() { }

  hasClass(element, className) {
    return new RegExp(' ' + className + ' ').test(' ' + element.className + ' ');
  }

  toggleClass(element, className) {
    var newClass = ' ' + element.className.replace(/[\t\r\n]/g, " ") + ' ';
    if (this.hasClass(element, className)) {
      while (newClass.indexOf(" " + className + " ") >= 0) {
        newClass = newClass.replace(" " + className + " ", " ");
      }
      element.className = newClass.replace(/^\s+|\s+$/g, '');
    } else {
      element.className += ' ' + className;
    }
  }
}
