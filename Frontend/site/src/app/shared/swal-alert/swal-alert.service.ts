import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SwalAlertService {

  constructor() { }

  getSwalForConfirm(title: string, text: string, icon: SweetAlertIcon = 'warning', showCancelButton: boolean = true, confirmButtonColor: string = '#3085d6', cancelButtonColor: string = '#d33', confirmButtonText: string = 'Confirm', allowOutsideClick = false, allowEscapeKey = false) {
    return Swal.fire({
      title: title,
      html: text,
      icon: icon,
      confirmButtonText: confirmButtonText,
      confirmButtonColor: confirmButtonColor,
      showCancelButton: showCancelButton,
      cancelButtonColor: cancelButtonColor,
      allowOutsideClick: allowOutsideClick,
      allowEscapeKey: allowEscapeKey,

    })
  }

  getSwalForNotification(title: string, text: string, icon: SweetAlertIcon = 'success', timer: number = 1600) {
    return Swal.fire({
      icon: icon,
      title: title,
      html: text,
      showConfirmButton: false,
      timer: timer
    })
  }

  getSwalToastNotification(showConfirmButton, time, timerProgressBar, title) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-right',
      showConfirmButton: showConfirmButton,
      timer: time,
      timerProgressBar: timerProgressBar,
      width: 400,
      onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
    return Toast.fire({
      icon: "success",
      title: title
    })
  }

  getSwalCheckboxNotification(title: string, text: string, icon: SweetAlertIcon = 'warning', checkboxCondition, checkboxReminderMessage, showCancelButton: boolean = true, confirmButtonColor: string = '#3085d6', cancelButtonColor: string = '#d33', confirmButtonText: string = 'Confirm', allowOutsideClick = false, allowEscapeKey = false) {
    return Swal.fire({
      title: title,
      html: text,
      icon: icon,
      confirmButtonText: confirmButtonText,
      confirmButtonColor: confirmButtonColor,
      showCancelButton: showCancelButton,
      cancelButtonColor: cancelButtonColor,
      allowOutsideClick: allowOutsideClick,
      allowEscapeKey: allowEscapeKey,
      input: 'checkbox',
      inputPlaceholder: checkboxCondition,
      inputValidator: (result) => {
        return !result && checkboxReminderMessage
      }
    })
  }

  getSwalForConfirmWithMessage(title: string, text: string, icon: SweetAlertIcon = 'warning', showCancelButton: boolean = true, confirmButtonColor: string = '#3085d6', cancelButtonColor: string = '#d33', confirmButtonText: string = 'Confirm', allowOutsideClick = false, allowEscapeKey = false) {
    return Swal.fire({
      title: title,
      html: text,
      icon: icon,
      confirmButtonText: confirmButtonText,
      confirmButtonColor: confirmButtonColor,
      showCancelButton: showCancelButton,
      cancelButtonColor: cancelButtonColor,
      allowOutsideClick: allowOutsideClick,
      allowEscapeKey: allowEscapeKey,
      input: 'textarea',
      inputPlaceholder: 'Type your reason here...',
      inputAttributes: {
        'aria-label': 'Type your reason here'
      }
    })
  }
}
