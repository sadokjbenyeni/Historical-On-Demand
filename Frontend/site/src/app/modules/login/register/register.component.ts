import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { BillingInformation } from '../../../shared/user/models/billing-information.model';
import { ContactInformations } from '../../../shared/user/models/contact-informations.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { SwalAlertService } from '../../../shared/swal-alert/swal-alert.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class RegisterComponent implements OnInit, AfterViewInit {
  contactInformations: ContactInformations;
  billigInformations: BillingInformation;
  //loginForm: FormGroup;
  hideConfirm: boolean = true;
  hideNew: boolean = true;
  disableNew: boolean;
  user: any;
  cvg: boolean = false;
  commercial: boolean = false
  checkrobot: boolean;
  password: string;
  @ViewChild('stepper') private myStepper: MatStepper;
  selectedIndex: any;

  constructor(
    //private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private swalService: SwalAlertService) { }

  ngAfterViewInit(): void {
    this.myStepper.selected.completed = false;
  }

  ngOnInit(): void {
    this.contactInformations = <ContactInformations>{};
    this.billigInformations = <BillingInformation>{};
  }




  getBillingInformations(informations) {
    this.myStepper.selected.completed = true;
    this.myStepper.next();

    this.myStepper.selected.completed = false;
  }

  getContactInformations(informations) {
    if (informations.contactInformationsIsCompleted) {
      this.myStepper.selected.completed = true;
      this.myStepper.next();
    }
    this.myStepper.selected.completed = false;
  }

  getPassword(password) {
    this.password = password;

    this.myStepper.selected.completed = true;
    this.myStepper.next();

    this.myStepper.selected.completed = false;
  }

  setUserInformations() {
    this.user = {
      id: <string>'',
      firstname: this.contactInformations.firstName,
      lastname: this.contactInformations.lastName,
      email: this.contactInformations.emailAdress,
      password: this.password,
      job: this.contactInformations.jobRole,
      companyName: this.contactInformations.companyName,
      companyType: this.contactInformations.companyType,
      country: this.contactInformations.country,
      address: this.contactInformations.address,
      postalCode: this.contactInformations.postalCode,
      city: this.contactInformations.city,
      countryBilling: this.billigInformations.billingCountry,
      addressBilling: this.billigInformations.billingAddress,
      postalCodeBilling: this.billigInformations.billingPostalCode,
      cityBilling: this.billigInformations.billingCity,
      region: this.contactInformations.region,
      phone: this.contactInformations.phoneNumber,
      website: this.contactInformations.webSite,
      currency: this.billigInformations.billingCurrency,
      payment: this.billigInformations.billingPayment,
      vat: this.billigInformations.vatNumber,
      checkvat: <boolean>false,
      cgv: this.cvg,
      commercial: this.commercial
    };
  }

  register() {
    this.setUserInformations();
    let title = "Confirm your register ?"
    let text = "Do you confirm your register informations ?"
    this.swalService.getSwalForConfirm(title, text, 'question').then(result => {
      if (result) {
        this.userService.create(this.user).subscribe(data => {
          sessionStorage.setItem('register', 'ok')
          this.router.navigate(['/login']);
        },
          error => {
            console.error(error);
          });
      }
    });

  }

  resolved(captchaResponse: string) {
    if (captchaResponse) {
      this.checkrobot = false;
    } else {
      this.checkrobot = true;
    }
  }
  // onStepChange(stepChanges) {
  //   debugger
  //   if (this.myStepper.selectedIndex != stepChanges.selectedIndex)
  //     this.myStepper.selectedIndex = stepChanges.selectedIndex
  //   //this.myStepper.selectedIndex = stepChanges.selectedIndex;
  // }

}
