import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { BillingInformation } from '../../../shared/models/billing-information.model';
import { ContactInformations } from '../../../shared/models/contact-informations.model';

@Component({
  selector: 'app-user-informations',
  templateUrl: './user-informations.component.html',
  styleUrls: ['./user-informations.component.css']
})
export class UserInformationsComponent implements OnChanges {
  @Input() user: any;
  billigInformations: BillingInformation;
  contactInformations: ContactInformations;

  id: any;
  roles: any;
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    route.params.subscribe(params => this.id = params.id);
  }

  ngOnChanges(userchanged: any): void {
    this.user = userchanged.user.currentValue;
    this.billigInformations = <BillingInformation>{};
    this.contactInformations = <ContactInformations>{};
    this.setBillingInformations(userchanged.user.currentValue);
    this.setContactInformations(userchanged.user.currentValue);
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

  getRoles(){
    this.userService.getRoles().subscribe(res => {
      this.roles = res.roles;
    });
  }
  addRole(e) {
    if (e) {
      this.user['roleName'].push(e);
    }
  }
  delRole(e) {
    this.user['roleName'].splice(this.user['roleName'].indexOf(e), 1);
  }
}
