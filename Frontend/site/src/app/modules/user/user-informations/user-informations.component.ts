import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { BillingInformation } from '../../../shared/user/models/billing-information.model';
import { ContactInformations } from '../../../shared/user/models/contact-informations.model';
import { FormControl } from '@angular/forms';
import { MatChip, MatChipList } from '@angular/material/chips';

@Component({
  selector: 'app-user-informations',
  templateUrl: './user-informations.component.html',
  styleUrls: ['./user-informations.component.css']
})
export class UserInformationsComponent implements OnInit, OnChanges {

  userRoles: any;
  @Input() user: any;
  billigInformations: BillingInformation;
  contactInformations: ContactInformations;
  id: any;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    route.params.subscribe(params => this.id = params.id);
  }
  ngOnInit(): void {
    this.userRoles = this.user.roleName;
  }

  ngOnChanges(userchanged: any): void {
    this.user = userchanged.user.currentValue;
    this.billigInformations = <BillingInformation>{};
    this.contactInformations = <ContactInformations>{};
    this.setBillingInformations(userchanged.user.currentValue);
    this.setContactInformations(userchanged.user.currentValue);
    this.userRoles = this.user.roleName;
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
}


