import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SwalAlertService {

  constructor() { }

  getSwalForConfirm(title: string, text: string, icon: SweetAlertIcon = 'warning', showCancelButton: boolean = true, confirmButtonColor: string = '#3085d6', cancelButtonColor: string = '#d33', confirmButtonText: string = 'Confirm') {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonText: confirmButtonText,
      confirmButtonColor: confirmButtonColor,
      showCancelButton: showCancelButton,
      cancelButtonColor: cancelButtonColor
    })
  }

  getSwalForNotification(title: string, text: string, icon: SweetAlertIcon = 'success', timer: number = 1500) {
    return Swal.fire({
      icon: icon,
      title: title,
      text: text,
      showConfirmButton: false,
      timer: timer
    })
  }
}
