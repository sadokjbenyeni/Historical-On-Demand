import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../../services/countries.service';
import { ContactInformations } from '../models/contact-informations.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-informations',
  templateUrl: './contact-informations.component.html',
  styleUrls: ['./contact-informations.component.css']
})
export class ContactInformationsComponent implements OnInit, OnChanges {

  @Input() contactInformations: ContactInformations;
  form: FormGroup;
  toUpdate: boolean = false;

  country: any;
  constructor(private formBuilder: FormBuilder, private countriesService: CountriesService, private router: Router) {

  }
  ngOnInit(): void {
    this.getCountry();
  }

  ngOnChanges(userChanged): void {
    this.initFields();
  }
  initFields() {
    this.form = this.formBuilder.group({
      address: [{ value: this.contactInformations.address, disabled: !this.toUpdate }],
      city: [{ value: this.contactInformations.city, disabled: !this.toUpdate }],
      companyName: [{ value: this.contactInformations.companyName, disabled: !this.toUpdate }, Validators.required],
      companyType: [{ value: this.contactInformations.companyType, disabled: !this.toUpdate }],
      firstName: [{ value: this.contactInformations.firstName, disabled: !this.toUpdate }, Validators.required],
      lastName: [{ value: this.contactInformations.lastName, disabled: !this.toUpdate }, Validators.required],
      jobRole: [{ value: this.contactInformations.jobRole, disabled: !this.toUpdate }, Validators.required],
      phoneNumber: [{ value: this.contactInformations.phoneNumber, disabled: !this.toUpdate }],
      postalCode: [{
        value: this.contactInformations.postalCode, disabled: !this.toUpdate
      }],
      region: [{ value: this.contactInformations.region, disabled: !this.toUpdate }],
      webSite: [{ value: this.contactInformations.webSite, disabled: !this.toUpdate }],
      country: [{ value: this.contactInformations.country, disabled: !this.toUpdate }, Validators.required],
      emailAdress: [{ value: this.contactInformations.emailAdress, disabled: !this.toUpdate }, Validators.required]
    });
  }
  getCountry() {
    this.countriesService.getCountries().subscribe(res => {
      this.country = res.countries;
    });
  }

}
