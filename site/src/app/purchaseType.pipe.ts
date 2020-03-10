import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'purchasetype'
})
export class PurchaseTypePipe implements PipeTransform {

  transform(value: Array<any>, args?: any): any {
    let purchasetype: string = '';
    if (value.find(item => item.subscription == 1) != undefined) purchasetype += "Subscription ";
    if (value.find(item => item.onetime == 1) != undefined) purchasetype += "One-Off"
    return purchasetype;
  }

}
