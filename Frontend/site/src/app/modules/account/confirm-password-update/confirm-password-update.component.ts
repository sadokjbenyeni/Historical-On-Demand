import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SwalAlertService } from '../../../shared/swal-alert/swal-alert.service';

@Component({
  selector: 'app-confirm-password-update',
  templateUrl: './confirm-password-update.component.html',
  styleUrls: ['./confirm-password-update.component.css']
})
export class ConfirmPasswordUpdateComponent implements OnInit {
  token: string;
  constructor(
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private swalService: SwalAlertService) { }

  ngOnInit(): void {
    this.token = this.activatedRoute.snapshot.params.token;
    this.updateUserPassword();
  }

  async updateUserPassword() {
    var result = await this.swalService.getSwalForConfirm('Are you sure?', "You are going to update your password!")
    if (result.value) {
      this.userService.updateUserPassword(this.token)
        .subscribe(result => {
          if (result.updated) {
            this.swalService.getSwalForNotification('password updated', 'Your password have been updated!')
          }
          else {
            this.swalService.getSwalForNotification('Updating email adress Failed !', "An error has occured !", 'error')
          }
          this.router.navigate(['/login']);
        },
          error => {
            if (error.error.error === "jwt expired") {
              this.swalService.getSwalForNotification('Updating password Failed!', " <b> Your link has expired ! </b>", 'error', 2000);
            }
            else {
              this.swalService.getSwalForNotification('Updating password Failed!', `<b> ${error.error.error}! </b>`, 'error', 2000);
            }
            this.router.navigate(['/login']);
          })
    }
  }
}
