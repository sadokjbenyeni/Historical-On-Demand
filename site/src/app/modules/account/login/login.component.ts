import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgForm } from '@angular/forms';

import { UserService } from '../../../services/user.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  termspdf: string;
  viewterms: boolean;
  ula: boolean;
  colorMessage: string;
  email: string;
  token: string;
  pwd: string;
  password: string;
  page: string;
  message: string;
  showAll: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.termspdf = '/files/historical_data_tc.pdf';
    this.viewterms = false;
    this.ula = false;
    let ula = localStorage.getItem('ula');
    if ( ula !== null && ula !== '' ) {
      this.ula = (ula.toString() === 'true');
    }

    let user = JSON.parse(sessionStorage.getItem('user'));
    if ( user !== null && user !== {} ) {
      this.router.navigate(['/home']);
    }
    this.message = '';
    let register = sessionStorage.getItem('register');
    if(register === 'ok') {
      this.message = 'Your account has been created';
      this.colorMessage = 'alert alert-info'
    }
    let url = this.router.url.split('/');
    if (url[1] === "activation") {
      this.activate();
    }
    this.email = '';
    this.token = '';
    this.pwd = '';
    this.password = '';
    let route = this.router.url.split('/');
    this.page = route[1];
    if(route[1] === 'mdp'){
      this.token = route[2];
    }
  }

  activate() {
    this.activatedRoute.params.subscribe(params => {
      this.userService.activation({token:params.token}).subscribe(res => {
        this.message = res.message;
        this.colorMessage = 'alert alert-info';
        if(this.message === 'User Not Found' ){
          this.colorMessage = 'alert alert-danger';
        } else {
          this.page = 'activation';
        }
      });
    });  
  }

  mdp() {
    this.userService.verifmail({email:this.email}).subscribe(res => {
      if (!res.valid) {
        this.colorMessage = 'alert alert-danger';
        this.message = res.message;
      } else {
        this.userService.mdpmail({email:this.email, token:res.token}).subscribe(r => {
          if(r.mail){
            this.colorMessage = 'alert alert-info';
            this.message = 'An email has just been sent';
          } else {
            this.colorMessage = 'alert alert-danger';
            this.message = 'An error has occurred. Please try again';
          }
        });
      }
    });
  }

  savemdp(){
    this.userService.mdpmodif({token:this.token, pwd: this.password}).subscribe(res => {
      this.colorMessage = 'alert alert-info';
      this.message = 'Password successfully changed';
        setTimeout(() => {
          this.message = '';
          this.router.navigate(['/login']);
        }, 3000);
    });
  }

  check() {
    this.userService.check({email:this.email, pwd: this.password}).subscribe(res => {
      if (!res.user) {
        this.message = res.message;
        this.colorMessage = 'alert alert-danger';
      } else {
        sessionStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('ula', 'true');
        sessionStorage.removeItem('register')
        this.router.navigate(['/home']);
      }
    });
  }
  termsOpen() {
    this.viewterms = true;
  }
  termsClose() {
    this.viewterms = false;
  }

}
