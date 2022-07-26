import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ContactInformations } from '../../../shared/user/models/contact-informations.model';
import { ContactInformationsComponent } from '../../../shared/user/contact-informations/contact-informations.component';
import { BillingInformation } from '../../../shared/user/models/billing-information.model';
import { BillingInformationsComponent } from '../../../shared/user/billing-informations/billing-informations.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { translateAnimation } from '../../../shared/animations/animation.animation';
import { SwalAlertService } from '../../../shared/swal-alert/swal-alert.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  animations: [
    translateAnimation
  ]
})
export class AccountComponent implements OnInit {

  @ViewChild(ContactInformationsComponent) contactInformationsComponents: ContactInformationsComponent;
  @ViewChild(BillingInformationsComponent) billingInformationsComponents: BillingInformationsComponent;

  sectionName: string;
  user: any;
  contactInformations: ContactInformations;
  billigInformations: BillingInformation;
  changedValues = new Map<any, any>();

  constructor(private userService: UserService, private swalService: SwalAlertService) { }

  ngOnInit(): void {
    this.contactInformations = <ContactInformations>{};
    this.billigInformations = <BillingInformation>{};
    this.getUser();
  }

  getSection(section) {
    if (this.sectionName == undefined) this.sectionName = section;
    else {
      this.updateUserBySection(this.sectionName);
      this.sectionName = section;
      this.setContactInformations(this.user);
    }
  }

  getUser() {
    this.userService.getCompte().subscribe(account => {
      this.user = account.user;
      this.setContactInformations(this.user);
      this.setBillingInformations(this.user);
    });
  }

  updateUserBySection(section) {
    switch (section) {
      case "Contact Informations": {
        this.user.address = this.contactInformationsComponents.form.controls.address.value;
        this.user.city = this.contactInformationsComponents.form.controls.city.value;
        this.user.companyName = this.contactInformationsComponents.form.controls.companyName.value;
        this.user.companyType = this.contactInformationsComponents.form.controls.companyType.value;
        this.user.country = this.contactInformationsComponents.form.controls.country.value;
        this.user.firstname = this.contactInformationsComponents.form.controls.firstName.value;
        this.user.job = this.contactInformationsComponents.form.controls.jobRole.value;
        this.user.lastname = this.contactInformationsComponents.form.controls.lastName.value;
        this.user.phone = this.contactInformationsComponents.form.controls.phoneNumber.value;
        this.user.postalCode = this.contactInformationsComponents.form.controls.postalCode.value;
        this.user.region = this.contactInformationsComponents.form.controls.region.value;
        this.user.website = this.contactInformationsComponents.form.controls.webSite.value;
        break;
      }

      case "Billing Informations": {
        this.user.vat = this.billingInformationsComponents.form.controls.vat.value;
        this.user.addressBilling = this.billingInformationsComponents.form.controls.addressBilling.value;
        this.user.cityBilling = this.billingInformationsComponents.form.controls.cityBilling.value;
        this.user.countryBilling = this.billingInformationsComponents.form.controls.countryBilling.value;
        this.user.currency = this.billingInformationsComponents.form.controls.currency.value;
        this.user.payment = this.billingInformationsComponents.form.controls.payment.value;
        this.user.postalCodeBilling = this.billingInformationsComponents.form.controls.postalCodeBilling.value;
        break;
      }
    }
  }

  setContactInformations(user) {
    this.contactInformations.companyType = user.companyType;
    this.contactInformations.city = user.city;
    this.contactInformations.address = user.address;
    this.contactInformations.companyName = user.companyName;
    this.contactInformations.country = user.country;
    this.contactInformations.firstName = user.firstname;
    this.contactInformations.lastName = user.lastname;
    this.contactInformations.phoneNumber = user.phone;
    this.contactInformations.postalCode = user.postalCode;
    this.contactInformations.region = user.region;
    this.contactInformations.jobRole = user.job;
    this.contactInformations.webSite = user.website;
    this.contactInformations.emailAdress = user.email;
  }

  setBillingInformations(user) {
    this.billigInformations.billingAddress = user.addressBilling;
    this.billigInformations.billingCity = user.cityBilling;
    this.billigInformations.billingCountry = user.countryBilling;
    this.billigInformations.billingPostalCode = user.postalCodeBilling;
    this.billigInformations.vatNumber = user.vat;
    this.billigInformations.billingPayment = user.payment;
    this.billigInformations.billingCurrency = user.currency;
  }

  updateInformations() {
    this.getSection(this.sectionName);


    this.swalService.getSwalForConfirm('Are you sure?', "You are going to update your account!", 'warning', true, '#3085d6', '#d33', 'Confirm')
      .then((result) => {
        if (result.value) {
          this.userService.updateUser(this.user)
            .subscribe(result => {
              if (result) {
                this.swalService.getSwalForNotification('Account updated', 'Your account have been updated!', 'success', 1500),
                  error => {
                    this.swalService.getSwalForNotification('Updating account Failed !', error.message, 'error', 1500)
                  }
              }
            })
        }
      })
  }

  getChangedValues(form: any) {
    Object.keys(form.controls)
      .forEach(key => {
        let currentControl = form.controls[key];
        if (currentControl.dirty) {
          if (currentControl.controls) this.getChangedValues(currentControl);
          else this.changedValues.set(key, currentControl.value)
        }
      });
    return this.changedValues;
  }

  getNewUser(user) {
    this.user = user
  }
}
