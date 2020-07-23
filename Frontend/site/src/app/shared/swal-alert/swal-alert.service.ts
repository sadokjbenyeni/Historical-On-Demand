import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SwalAlertService {

  constructor() { }

  getSwalForConfirm(title: string, text: string, icon: SweetAlertIcon, showCancelButton: boolean, confirmButtonColor: string, cancelButtonColor: string, confirmButtonText: string) {
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


  getSwalForNotification(title: string, text: string, icon: SweetAlertIcon, timer: number) {
    return Swal.fire({
      icon: icon,
      title: title,
      text: text,
      showConfirmButton: false,
      timer: timer ? timer : 1500
    })
  }
}
