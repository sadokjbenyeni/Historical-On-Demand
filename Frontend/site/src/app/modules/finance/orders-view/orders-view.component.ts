import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { OrderService } from '../../../services/order.service';
import { ConfigService } from '../../../services/config.service';
import { CurrencyService } from '../../../services/currency.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DownloadInvoiceService } from '../../../services/Intern/download-invoice.service';
import { SwalAlertService } from '../../../../app/shared/swal-alert/swal-alert.service';
import { BurgerMenuService } from '../../../../app/shared/burger-menu/burger-menu.service';

@Component({
  selector: 'app-orders-view',
  templateUrl: './orders-view.component.html',
  styleUrls: ['./orders-view.component.css']
})
export class OrdersViewComponent implements OnInit {
  idOrder: any;
  existSubscribe: boolean;
  totalHTOld: number;
  currencyTxUsd: any;
  currencyTx: any;
  companyName: any;
  payment: string;
  firstname: any;
  lastname: any;
  job: any;
  country: any;
  currency: any;
  symbols: any[];
  totalVat: number;
  totalTTC: number;
  totalHT: number;
  totalFees: number;
  symbol: string;
  message: string;
  action: string;
  list: object;
  cmd: object;
  idCmd: string;
  submissionDate: string;
  state: string;
  states: Array<any>;
  discount: number;
  ht: number;
  vat: number;
  total: number;
  fees: number;
  cart: Array<any>;
  invoice: string;
  proForma: string;
  internalNote: string;
  sale: string;
  ordertype: string;
  actionButton: string = "ACTIONS";
  closeActionButton: string = "CLOSE";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private currencyService: CurrencyService,
    private orderService: OrderService,
    private downloadInvoiceService: DownloadInvoiceService,
    private swalService: SwalAlertService,
    private burgerMenuService: BurgerMenuService

  ) {
    route.params.subscribe(_ => this.idCmd = _.id);
  }

  ngOnInit() {
    this.cart = [];
    this.symbols = [];
    this.message = '';
    this.action = '';
    this.symbol = '';
    this.ht = 0;
    this.vat = 1;
    this.fees = 0;
    this.discount = 0;
    this.total = 0;
    this.totalHT = 0;
    this.totalHTOld = 0;
    this.state = '';
    this.getListStates();
    this.getCmd();
  }

  getState(stateId) {
    if (!this.states) return stateId;
    return this.states.filter(state => state.id === stateId)[0] ? this.states.filter(state => state.id === stateId)[0].name : stateId;
  }
  getCmd() {
    this.currencyService.getCurrencies().subscribe(listOf => {
      this.symbols = [];
      listOf.currencies.forEach(listOfSymbols => {
        this.symbols[listOfSymbols.id] = listOfSymbols.symbol;
      });
      this.orderService.getIdOrder(this.idCmd).subscribe((listOfCommands) => {

        this.list = listOfCommands;
        this.sale = listOfCommands.cmd.sales
        this.idCmd = listOfCommands.cmd.id_cmd;
        this.invoice = listOfCommands.cmd.idCommande;
        this.proForma = listOfCommands.cmd.idProForma;
        this.idOrder = listOfCommands.cmd.id;
        this.cmd = listOfCommands.cmd;
        this.companyName = listOfCommands.cmd.companyName;
        this.payment = listOfCommands.cmd.payment;
        this.firstname = listOfCommands.cmd.firstname;
        this.lastname = listOfCommands.cmd.lastname;
        this.job = listOfCommands.cmd.job;
        this.country = listOfCommands.cmd.countryBilling;
        this.discount = listOfCommands.cmd.discount;
        this.currency = listOfCommands.cmd.currency;
        this.currencyTx = listOfCommands.cmd.currencyTx;
        this.currencyTxUsd = listOfCommands.cmd.currencyTxUsd;
        this.totalFees = listOfCommands.cmd.totalExchangeFees;
        this.totalHT = listOfCommands.cmd.totalHT;
        this.totalHTOld = this.getHt(listOfCommands.cmd.totalHT) + this.totalFees;
        this.vat = listOfCommands.cmd.vatValue;
        this.totalVat = this.totalHT * (this.vat / 100);
        this.totalTTC = listOfCommands.cmd.total;
        this.submissionDate = listOfCommands.cmd.submissionDate;
        this.internalNote = listOfCommands.cmd.internalNote;
        this.state = listOfCommands.cmd.state;
        this.ordertype = listOfCommands.cmd.type;
        let index = 0;
        if (listOfCommands.cmd.products.length > 0) {
          this.existSubscribe = false;
          this.list['cmd'].products.forEach((product) => {
            if (product.subscription === 1) { this.existSubscribe = true; }
            let diff = this.dateDiff(new Date(product.begin_date), new Date(product.end_date));
            if (product.onetime === 1) {
              product.price = (diff.day + 1) * product.price;
            } else if (product.subscription === 1) {
              product.price = product.period * product.price;
            }
            index++;
            let prod = {
              idx: index,
              print: false,
              idCmd: listOfCommands.cmd.id_cmd,
              id_undercmd: product.id_undercmd,
              status: 'validated',
              quotation_level: product.dataset,
              symbol: product.symbol,
              exchange: product.exchangeName,
              assetClass: product.assetClass,
              mics: product.mics,
              eid: product.eid,
              qhid: product.qhid,
              contractid: product.contractid,
              description: product.description,
              onetime: product.onetime,
              subscription: product.subscription,
              pricingTier: product.pricingTier,
              period: product.period,
              price: product.price,
              ht: product.ht,
              begin_date_select: product.begin_date,
              begin_date_ref: product.begin_date_ref,
              end_date_select: product.end_date,
              end_date_ref: product.end_date_ref,
              backfill_fee: product.backfill_fee,
              ongoing_fee: product.ongoing_fee
            };
            this.ht += product.price;
            this.cart.push(prod);
            if (product.backfill_fee > 0 || product.ongoing_fee > 0) {
              this.cart.push({ print: true, backfill_fee: product.backfill_fee, ongoing_fee: product.ongoing_fee });
            }
          });
        }
      });
    });
  }

  verifState() {
    if (this.state === 'PVF') return true;
    else return false;
  }

  dateDiff(firstDate, secondDate) {
    let calculatedDate = { sec: 0, min: 0, hour: 0, day: 0 };
    let dateDifference = secondDate - firstDate;
    dateDifference = Math.floor(dateDifference / 1000);
    calculatedDate.sec = dateDifference % 60;
    dateDifference = Math.floor((dateDifference - calculatedDate.sec) / 60);
    calculatedDate.min = dateDifference % 60;
    dateDifference = Math.floor((dateDifference - calculatedDate.min) / 60);
    calculatedDate.hour = dateDifference % 24;
    dateDifference = Math.floor((dateDifference - calculatedDate.hour) / 24);
    calculatedDate.day = dateDifference;
    return calculatedDate;
  }

  getHt(val) {
    if (this.currency !== 'usd') return ((val / this.currencyTxUsd) * this.currencyTx);
    else return val;
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  getListStates() {
    this.orderService.getListStates({}).subscribe(order => { this.states = order['states'] });
  }

  getStateName(stateId) {
    let specificState = this.states.filter(state => state.id === stateId)[0]
    if (!this.states) return stateId;
    return specificState ? specificState.name : stateId;
  }

  downloadInvoice(invoice, pdfType) {
    this.downloadInvoiceService.getInvoice(this.idOrder, invoice, pdfType);
  }

  async validateOrder() {
    var result = await this.swalService.getSwalForConfirm('Are you sure?', `You are going to validate order number <b> ${this.idOrder}</b>`)
    if (result.value) {
      this.orderService.state({ idCmd: this.idCmd, id: this.idOrder, status: 'validated', referer: 'Finance', product: this.cart, email: this.cmd['email'] })
        .subscribe(result => {
          if (result) {
            this.swalService.getSwalForNotification(`Order ${this.idOrder} validatd`, ` <b> Order ${this.idOrder} validatd`),
              error => {
                this.swalService.getSwalForNotification('Validation Failed !', error.message, 'error')
              }
          }
        })
      this.router.navigate(['/finance/orders']);
    }
  }

  expandMenu() {
    let element = <HTMLElement>document.getElementById('toggle');
    this.burgerMenuService.toggleClass(element, 'on');
    let menuTitle = <HTMLElement>document.getElementById('menu-title');
    if (menuTitle.textContent == this.closeActionButton) menuTitle.textContent = this.actionButton;
    else menuTitle.textContent = this.closeActionButton;
    return false;
  }
}
