import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../../services/countries.service';
import { ContactInformations } from '../models/contact-informations.model';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-contact-informations',
  templateUrl: './contact-informations.component.html',
  styleUrls: ['./contact-informations.component.css']
})
export class ContactInformationsComponent implements OnInit, OnChanges {

  @Input() contactInformations: ContactInformations;
  @Output() emitContactInformations = new EventEmitter();

  form: FormGroup;
  @Input() toUpdate: boolean = false;
  countries: any[] = [];
  @Input() forRegister: boolean;
  emailExist: any;

  constructor(private formBuilder: FormBuilder, private countriesService: CountriesService, private router: Router, private userService: UserService) {
  }
  ngOnInit(): void {
    this.getCountry();
  }

  ngOnChanges(): void {
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
      emailAdress: [{ value: this.contactInformations.emailAdress, disabled: !this.toUpdate }, [Validators.required, Validators.email]]
    });
  }
  getCountry() {
    this.countriesService.getCountries().subscribe(res => {
      this.countries = res.countries;
    });
  }

  fillContactInformations() {
    this.contactInformations.address = this.form.controls.address.value;
    this.contactInformations.city = this.form.controls.city.value;
    this.contactInformations.companyName = this.form.controls.companyName.value;
    this.contactInformations.companyType = this.form.controls.companyType.value;
    this.contactInformations.country = this.form.controls.country.value;
    this.contactInformations.emailAdress = this.form.controls.emailAdress.value;
    this.contactInformations.firstName = this.form.controls.firstName.value;
    this.contactInformations.lastName = this.form.controls.lastName.value;
    this.contactInformations.jobRole = this.form.controls.jobRole.value;
    this.contactInformations.phoneNumber = this.form.controls.phoneNumber.value;
    this.contactInformations.postalCode = this.form.controls.postalCode.value;
    this.contactInformations.region = this.form.controls.region.value;
    this.contactInformations.webSite = this.form.controls.webSite.value;
  }
  sendContactInformations() {
    this.fillContactInformations();
    this.emitContactInformations.emit({ contactInformations: this.contactInformations, contactInformationsIsCompleted: true })

  }

  checkEmailIfExist() {
    let email = this.form.controls["emailAdress"].value;
    if (email) {
      this.userService.checkEmailIfExist(email).subscribe(result => {
        this.emailExist = result.exist;
      });
    }
  }

}
