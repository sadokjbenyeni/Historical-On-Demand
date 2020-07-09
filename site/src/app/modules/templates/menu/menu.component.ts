import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../../../services/user.service';
import * as jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  link: any = "";
  role: string = "";

  constructor(
    private router: Router,
    private userService: UserService
  ) {

  }

  ngOnInit() {
    let token = sessionStorage.getItem('token');
    if (token) {
      this.role = jwt_decode(token).roleName
    }
  }

  logout() {
    let token = sessionStorage.getItem('token');
    if (token) {
      this.userService.logout({ token: token }).subscribe(() => {
        this.role = '';
        sessionStorage.removeItem('token');
        sessionStorage.setItem('dataset', JSON.stringify({ "dataset": "", "title": "" }));
        this.router.navigate(['/home']);
      });
    }
  }



  // openNav() {
  //   document.getElementById('mySidenav').style.width = '250px';
  // }

  // closeNav() {
  //   document.getElementById('mySidenav').style.width = '0';
  // }
}
