import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'purchasetype'
})
export class PurchaseTypePipe implements PipeTransform {

  transform(value: Array<any>, args?: any): any {
    if (value.find(item => item.subscription == 1) != undefined && value.find(item => item.onetime == 1) != undefined) return "One-Off & Subscription";
    if (value.find(item => item.subscription == 1) != undefined) return "Subscription";
    if (value.find(item => item.onetime == 1) != undefined) return "One-Off";
    return "N/A";
  }

}
