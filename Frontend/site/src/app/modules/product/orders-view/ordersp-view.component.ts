import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { OrderService } from '../../../services/order.service';
import { ConfigService } from '../../../services/config.service';
import { CurrencyService } from '../../../services/currency.service';
import { AlertService } from '../../_alert';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SalesService } from '../../../services/sales.service';
import { DownloadInvoiceService } from '../../../services/Intern/download-invoice.service';
import { SwalAlertService } from '../../../../app/shared/swal-alert/swal-alert.service';
import { BurgerMenuService } from '../../../../app/shared/burger-menu/burger-menu.service';
import { forEach } from 'lodash';

@Component({
  selector: 'app-ordersp-view',
  templateUrl: './ordersp-view.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./ordersp-view.component.css']
})
export class OrderspViewComponent implements OnInit {
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
  totalHTDiscountFree: number;
  symbol: string;
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
  reason: any;
  invoice: string;
  proForma: string;
  internalNote: string;
  choosenSale: string;
  listSales: string[] = [];
  choosedOrderType: string;
  editOff: boolean = false;
  options = {
    autoClose: true,
    keepAfterRouteChange: false
  };
  actionButton: string = "ACTIONS";
  closeActionButton: string = "CLOSE";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private currencyService: CurrencyService,
    private orderService: OrderService,
    private salesService: SalesService,
    protected alertService: AlertService,
    private downloadInvoiceService: DownloadInvoiceService,
    private swalService: SwalAlertService,
    private burgerMenuService: BurgerMenuService
  ) {
    route.params.subscribe(_ => this.idCmd = _.id);
  }

  ngOnInit() {
    this.cart = [];
    this.symbols = [];
    this.reason = '';
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
    this.salesService.getSales().subscribe(result => {
      this.listSales = result;

    })
  }

  setPeriod(p) {
    this.ht = 0;
    this.list['cmd'].products.forEach((prd, i) => {
      if (prd.id_undercmd === p.idElem) {
        p.ht = p.period * parseInt(p.price, 10);
        prd.ht = p.ht;
      }
      this.ht += prd.ht;
    });
    this.totalFees = this.list['cmd'].totalExchangeFees;
    this.totalHT = (this.ht - (this.ht * this.discount / 100)) + this.totalFees;
    this.totalHTOld = this.ht + this.totalFees;
    this.totalVat = this.totalHT * this.vat;
    this.totalTTC = this.totalHT + this.totalVat;
  }

  getCmd() {
    this.currencyService.getCurrencies().subscribe(r => {
      this.symbols = [];
      r.currencies.forEach(s => {
        this.symbols[s.id] = s.symbol;
      });
      this.orderService.getIdOrder(this.idCmd).subscribe((c) => {
        this.list = c;
        this.idCmd = c.cmd.id_cmd;
        this.invoice = c.cmd.idCommande;
        this.idOrder = c.cmd.id;
        this.cmd = c.cmd;
        this.companyName = c.cmd.companyName;
        this.proForma = c.cmd.idProForma;
        this.payment = c.cmd.payment;
        this.firstname = c.cmd.firstname;
        this.lastname = c.cmd.lastname;
        this.job = c.cmd.job;
        this.country = c.cmd.countryBilling;
        this.discount = c.cmd.discount;
        this.currency = c.cmd.currency;
        this.currencyTx = c.cmd.currencyTx;
        this.currencyTxUsd = c.cmd.currencyTxUsd;
        this.totalFees = c.cmd.totalExchangeFees;
        this.totalHT = c.cmd.totalHT;
        this.totalHTOld = this.getHt(c.cmd.totalHT) + this.totalFees;
        this.totalHTDiscountFree = c.cmd.totalHTDiscountFree;
        this.vat = c.cmd.vatValue;
        this.totalVat = this.totalHT * (this.vat / 100);
        this.totalTTC = c.cmd.total
        this.submissionDate = c.cmd.submissionDate;
        this.state = c.cmd.state;
        this.internalNote = c.cmd.internalNote;
        this.choosedOrderType = c.cmd.type ? c.cmd.type : "NA"
        let index = 0;
        this.choosenSale = (c.cmd.sales != undefined) ? c.cmd.sales : "no sales";

        if (c.cmd.products.length > 0) {
          this.existSubscribe = false;
          this.list['cmd'].products.forEach((p) => {
            if (p.subscription === 1) {
              this.existSubscribe = true;
            }
            index++;
            let prod = {
              idx: index,
              print: false,
              idCmd: c.cmd.id_cmd,
              idElem: p.id_undercmd,
              id_undercmd: p.id_undercmd,
              quotation_level: p.dataset,
              symbol: p.symbol,
              exchange: p.exchangeName,
              assetClass: p.assetClass,
              eid: p.eid,
              qhid: p.qhid,
              contractid: p.contractid,
              description: p.description,
              onetime: p.onetime,
              subscription: p.subscription,
              pricingTier: p.pricingTier,
              period: p.period,
              price: p.price,
              ht: p.ht,
              begin_date_select: p.begin_date,
              begin_date: p.begin_date_ref,
              end_date_select: p.end_date,
              end_date: p.end_date_ref
            };
            this.ht += p.price;
            this.cart.push(prod);
            if (p.backfill_fee > 0 || p.ongoing_fee > 0) {
              this.cart.push({ print: true, backfill_fee: p.backfill_fee, ongoing_fee: p.ongoing_fee });
            }
          });
        }
      });
    });
  }

  verifState() {
    let statesForCancel = ['PVP', 'PVF', 'PSC'];
    return statesForCancel.includes(this.state);
  }
  verifStatePVP() {
    let statesForCancel = ['PVP', 'PVF'];
    return statesForCancel.includes(this.state);
  }
  verifStateForCancel() {
    let statesForCancel = ['PVP', 'PVF', 'PSC', 'active', 'validated'];
    return statesForCancel.includes(this.state);
  }
  getHt(val) {
    if (this.currency !== 'usd') {
      return ((val / this.currencyTxUsd) * this.currencyTx);
    } else {
      return val;
    }
  }
  getListStates() {
    this.orderService.getListStates({}).subscribe(res => {
      this.states = res['states'];
    });
  }
  getStateName(stateId) {
    if (!this.states)
      return stateId;
    return this.states.filter(e => e.id === stateId)[0] ? this.states.filter(e => e.id === stateId)[0].name : stateId;
  }

  applyDiscount() {
    this.orderService.updateDiscount({ orderId: this.idOrder, totalHT: this.totalHTOld, discount: this.discount }).subscribe(res => {
    });
  }
  updateEngagementPeriod() {
    this.orderService.updateEngagementPeriod({ idCmd: this.idCmd, cart: this.cart, ht: this.ht }).subscribe(res => {
    });
  }
  updateChanges() {
    this.orderService.SaveOrderMetadata(this.idOrder, this.internalNote, this.choosenSale, this.choosedOrderType).subscribe(() => {
    }
    );
  }

  onDiscountChange() {
    if (this.discount < 0 || this.discount == null) this.discount = 0;
    if (this.discount > 100) this.discount = 100;
    let totaHTExchangeFeesFree = this.totalHTDiscountFree - this.totalFees;
    this.totalHT = (totaHTExchangeFeesFree - (totaHTExchangeFeesFree * this.discount / 100)) + this.totalFees;
    this.totalVat = (this.totalHT / 100) * 20;
    this.totalTTC = this.totalHT + this.totalVat;
  }

  downloadInvoice(invoice, pdfType) {
    this.downloadInvoiceService.getInvoice(this.idOrder, invoice, pdfType);
  }

  toggleEdit() {
    this.editOff = !this.editOff;
  }

  async validateOrder() {
    let statusAfterValidation = 'PVF';
    let referer = 'Product';
    if (this.totalTTC === 0) {
      statusAfterValidation = 'validated';
      referer = 'ProductAutovalidateFinance';
    }
    var result = await this.swalService.getSwalForConfirm('Are you sure?', `You are going to validate order number <b> ${this.idOrder}</b>`)
    if (result.value) {
      this.orderService.productStatusUpdate({ idCmd: this.idCmd, id: this.idOrder, status: statusAfterValidation, referer: referer, product: this.cart, email: this.cmd['email'] })
        .subscribe(result => {
          if (result) {
            this.swalService.getSwalForNotification(`Order ${this.idOrder} validatd`, ` <b> Order ${this.idOrder} validatd`),
              error => {
                this.swalService.getSwalForNotification('Validation Failed !', error.message, 'error')
              }
          }
        })
      this.router.navigate(['/product/orders']);
    }
  }

  async rejectOrder() {
    var result = await this.swalService.getSwalForConfirm('Are you sure?', `You are going to reject order number <b> ${this.idOrder}</b>`)
    if (result.value) {
      this.orderService.productStatusUpdate({ idCmd: this.idCmd, id: this.idOrder, status: 'rejected', referer: 'Product', reason: this.reason })
        .subscribe(result => {
          if (result) {
            this.swalService.getSwalForNotification(`Order ${this.idOrder} rejected`, ` <b> Order ${this.idOrder} rejected`),
              error => {
                this.swalService.getSwalForNotification('Rejection Failed !', error.message, 'error')
              }
          }
        })
      this.router.navigate(['/product/orders']);
    }
  }

  async cancelOrder() {
    var result = await this.swalService.getSwalForConfirm('Are you sure?', `You are going to cancel order number <b> ${this.idOrder}</b>`)
    if (result.value) {
      this.orderService.productStatusUpdate({ idCmd: this.idCmd, id: this.idOrder, status: 'cancelled', referer: 'Product' })
        .subscribe(result => {
          if (result) {
            this.swalService.getSwalForNotification(`Order ${this.idOrder} cancelled`, ` <b> Order ${this.idOrder} cancelled`),
              error => {
                this.swalService.getSwalForNotification('Cancellation Failed !', error.message, 'error')
              }
          }
        })
      this.router.navigate(['/product/orders']);
    }
  }

  async cancelValidation() {
    var result = await this.swalService.getSwalForConfirm('Are you sure?', `You are going to cancel order validation number <b> ${this.idOrder}</b>`)
    if (result.value) {
      this.orderService.cancelProductValidation(this.idOrder)
        .subscribe(result => {
          if (result) {
            this.swalService.getSwalForNotification(`Order ${this.idOrder} validation cancelled`, ` <b> Order ${this.idOrder} validation cancelled`),
              error => {
                this.swalService.getSwalForNotification('Validation Cancellation Failed !', error.message, 'error')
              }
          }
        })
      this.router.navigate(['/product/orders']);
    }
  }

  async getSwalToastNotification() {
    this.swalService.getSwalToastNotification(false, 4000, true, 'Changes Saved');
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



