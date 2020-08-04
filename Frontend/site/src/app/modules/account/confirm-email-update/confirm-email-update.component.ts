import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { SwalAlertService } from '../../../shared/swal-alert/swal-alert.service';

@Component({
  selector: 'app-confirm-email-update',
  templateUrl: './confirm-email-update.component.html',
  styleUrls: ['./confirm-email-update.component.css']
})
export class ConfirmEmailUpdateComponent implements OnInit {

  token: string;
  constructor(
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private swalService: SwalAlertService) {
  }

  ngOnInit(): void {
    this.token = this.activatedRoute.snapshot.params.token;
    this.openDialogForUpdateEmailAdress();
  }


  openDialogForUpdateEmailAdress(): void {
    this.swalService.getSwalForConfirm('Are you sure?', "You are going to update your email adress!")
      .then((result) => {
        if (result.value) {
          this.userService.updateEmailAdress(this.token)
            .subscribe(res => {
              if (res) {
                this.swalService.getSwalForNotification('Email updated', 'Your email adress have been updated!');
              }
              else {
                this.swalService.getSwalForNotification('Updating email adress Failed !', "An error has occured !", 'error')
              }
              this.router.navigate(['/login']);
            },
              error => {
                if (error.error.error === "jwt expired") {
                  this.swalService.getSwalForNotification('Updating email adress Failed!', " <b> Your link has expired ! </b>", 'error', 2000);
                }
                else {
                  this.swalService.getSwalForNotification('Updating email adress Failed!', " <b> error.error.error ! </b>", 'error', 2000);
                }
                this.router.navigate(['/login']);
              })
        }
      })
  }

}
