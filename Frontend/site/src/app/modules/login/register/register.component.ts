import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { BillingInformation } from '../../../shared/user/models/billing-information.model';
import { ContactInformations } from '../../../shared/user/models/contact-informations.model';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { SwalAlertService } from '../../../shared/swal-alert/swal-alert.service';
import { ContactInformationsComponent } from '../../../shared/user/contact-informations/contact-informations.component';
import { BillingInformationsComponent } from '../../../shared/user/billing-informations/billing-informations.component';
import { PasswordInformationsComponent } from '../../../shared/user/password-informations/password-informations.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalContent } from '../../../shared/modal-content/modal-content';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class RegisterComponent implements OnInit, AfterViewInit {
  @ViewChild(ContactInformationsComponent) contactInformationsComponent: ContactInformationsComponent;
  @ViewChild(BillingInformationsComponent) billingInformationsComponents: BillingInformationsComponent;
  @ViewChild(PasswordInformationsComponent) passwordInformationsComponent: PasswordInformationsComponent;
  contactInformations: ContactInformations;
  billigInformations: BillingInformation;
  user: any;
  cvg: boolean = false;
  commercial: boolean = false
  checkrobot: boolean;
  password: string;
  captchaKey: string = '6LcQ80cUAAAAANfU8xFYxntN36rEdS5X5H7bjv3_';;
  terms = [
    "1. Under these Market Data Feed Products Terms and Conditions (“MDFP TC”), QUANTHOUSE grants the Customer the right to use certain market data feed products (“FEED PRODUCTS”) developed by QUANTHOUSE and its affiliates. In the event of a conflict between the terms of this MDFP TC and the terms of a client order form, the terms of the order form with respect to the FEED PRODUCTS shall prevail.",
    "2. The Customer acknowledges and understands that the FEED PRODUCTS include market data and information provided by third parties, including but not limited to exchanges (“DATASOURCES”). Each DATASOURCE shall be identified in the client order form. The Customer acknowledges that any and all intellectual property rights subsisting in the data provided by DATASOURCES are and shall remain vested in the DATASOURCES. The Customer further acknowledges that such data constitutes valuable information, copyrighted materials, and proprietary rights of the DATASOURCES, not within the public domain.",
    "3. The Customer acknowledges and agrees that the Customer’s use of the FEED PRODUCTS and the data included therein shall be subject to the terms and conditions, restrictions, or limitations and any other requirements established by the DATASOURCES from time to time, including but not limited to any additional terms related to the FEED PRODUCTS or Service that QUANTHOUSE may provide as required by the DATASOURCES, by e-mail or URL website as amended from time to time and incorporated in this MDFP TC by reference (collectively, the “DATASOURCE Terms”). The Customer’s right to receive and use any portion of the FEED PRODUCTS provided any DATASOURCE is subject to automatic termination without liability on the part of QUANTHOUSE if QUANTHOUSE’s agreement with such DATASOURCE expires or terminates for any reason.  ",
    "4. QUANTHOUSE and its licensors hereby grant, subject to the terms and conditions of this MDFP TC and the relevant client order forms, a worldwide, non-exclusive, non-transferrable license to the Customer to use the FEED PRODUCTS identified in the client order form executed hereunder for its internal business only and solely in accordance with the terms and conditions of these MDFP TC and any applicable DATASOURCE Terms. Data provided in the FEED PRODUCTS is provided in FeedOS binary file format and the data files must be replayed using sample_feed_replay tool. Markets are delivered as a whole and instrument extraction must be performed by the Client. The recorded data is provided 'as is' basis, meaning: a. No data cleansing or data correction is applied. b. Data is not adjusted for Corporate Actions (splits, dividends, spin-offs etc.). c. Data gaps are not filled - regardless of the source of where they occurred. The FEED PRODUCTS shall not be (a) used for or in connection with any unlawful or unauthorized purpose or activity whatsoever; (b) altered in any way that make the market data and information contained therein inaccurate or misleading or (c) uses without proper authorization or otherwise misuses or tarnishes the name or trademarks of any DATASOURCE or the goodwill associated therewith or otherwise disparages or brings a DATASOURCE into disrepute. QUANTHOUSE shall not be responsible or liable for any disputes or claims, including without limitation in breach of contract, tort (including negligence), misrepresentation or breach of statutory duty, that relate to any DATASOURCES.",
    "5. QUANTHOUSE, ITS AFFILIATES AND ALL OF THEIR THIRD-PARTY LICENSORS DISCLAIM ANY AND ALL WARRANTIES AND REPRESENTATIONS, EXPRESS OR IMPLIED, INCLUDING ANY WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE OR USE AS TO THE FEED PRODUCTS, INCLUDING THE INFORMATION, DATA, SOFTWARE OR PRODUCTS CONTAINED THEREIN, OR THE RESULTS OBTAINED BY THEIR USE OR AS TO THE PERFORMANCE THEREOF. NEITHER QUANTHOUSE ITS AFFILIATES NOR ANY OF THEIR THIRD-PARTY LICENSORS GUARANTEE THE ADEQUACY, ACCURACY, TIMELINESS OR COMPLETENESS OF THE FEED PRODUCTS OR ANY COMPONENT THEREOF, THAT THE FEED PRODUCTS BE ERROR OR VIRUS FREE, OR THAT THE FEED PRODUCTS WILL MEET THE CUSTOMERS’ REQUIREMENTS. THE FEED PRODUCTS AND ALL COMPONENTS THEREOF ARE PROVIDED ON AN “AS IS” BASIS AND THE CUSTOMER’S USE OF THE SERVICE IS AT THE CUSTOMER’S OWN RISK.",
    "6. NOTWITHSTANDING ANYTHING TO THE CONTRARY IN THE ORDER FORM TERMS AND CONDITIONS, QUANTHOUSE SHALL NOT BE LIABLE IN ANY WAY TO THE CUSTOMER OR TO ANY OTHER PERSON OR ENTITY FOR ANY LOSSES, DAMAGES, COSTS OR EXPENSES, LOSS OF PROFITS, LOSS OF USE OR DIRECT, INDIRECT, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES, (INCLUDING, BUT NOT LIMITED TO, LOSS OF PROFITS, GOODWILL OR SAVINGS, DOWNTIME, DAMAGE TO OR REPLACEMENT OF PROGRAMS AND DATA) OR OTHER ECONOMIC HARDSHIP ARISING FROM THE USE OF ANY DATASOURCE’s DATA, PRODUCTS OR SERVICES BY CUSTOMER OR ITS OFFICERS, EMPLOYEES, OR AGENTS OR BY ANY THIRD PARTY, WHETHER OR NOT AUTHORIZED BY THE CUSTOMER, EVEN IF QUANTHOUSE WAS MADE AWARE OF THE POSSIBILITY OF SUCH DAMAGES IN ADVANCE, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY OR OTHERWISE.",
    "7. The Customer agrees to indemnify, protect and hold harmless QUANTHOUSE and its affiliates for any and all losses, damages, expenses and costs, including reasonable legal fees, arising from Customer’s use of any data, products or services provided by a DATASOURCE.",
    "8. The FEED PRODUCTS shall be delivered as specified in Section 3 and QUANTHOUSE, in its sole discretion may alter this format."];
  @ViewChild('stepper') private myStepper: MatStepper;
  selectedIndex: any;

  constructor(
    private router: Router,
    private userService: UserService,
    private swalService: SwalAlertService,
    private modalService: NgbModal) { }

  ngAfterViewInit(): void {
    this.myStepper.selected.completed = false;
  }

  ngOnInit(): void {
    this.contactInformations = <ContactInformations>{};
    this.billigInformations = <BillingInformation>{};
  }




  getBillingInformations(informations) {
    this.myStepper.selected.completed = true;
    this.myStepper.selectedIndex = 1;
    this.myStepper.next();
    this.myStepper.selected.completed = false;
  }

  getContactInformations(informations) {
    // if (informations.contactInformationsIsCompleted) {
    this.myStepper.selected.completed = true;
    this.myStepper.selectedIndex = 0;
    this.myStepper.next();
    //}
    this.myStepper.selected.completed = false;
  }

  getPassword(password) {
    this.password = password;

    this.myStepper.selected.completed = true;
    this.myStepper.selectedIndex = 2;
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
    console.log(this.billingInformationsComponents.form);

    if (!this.contactInformationsComponent.form.valid || !this.billingInformationsComponents.form.valid || !this.passwordInformationsComponent.loginForm.valid) {
      this.swalService
        .getSwalForNotification(
          "Please check your informations",
          "Some <b> required </b> fields are <b> empty </b> or <b> invalid </b>, please check your informations before signing up!",
          "error",
          2500)
    }
    else {
      let title = "Confirm your register ?"
      let text = "Do you confirm your register informations ?"
      this.swalService.getSwalForConfirm(title, text, 'question').then(result => {
        if (result.value) {
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
  }

  resolved(captchaResponse: string) {
    if (captchaResponse) {
      this.checkrobot = false;
    } else {
      this.checkrobot = true;
    }
  }

}
