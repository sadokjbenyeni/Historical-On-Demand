import { Component, OnInit, Input, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { OrderService } from '../../../services/order.service';
import { ConfigService } from '../../../services/config.service';
import { CurrencyService } from '../../../services/currency.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';
import { OrderDetails } from '../../../core/models/order-details.model';
import { OrderHistoryDetailsComponent } from '../../client/order-history-details/order-history-details.component';
import { DownloadInvoiceService } from '../../../services/Intern/download-invoice.service';
import { InvoiceService } from '../../../services/invoice.service';

@Component({
  selector: 'app-client-order-details',
  templateUrl: './client-order-details.component.html',
  styleUrls: ['./client-order-details.component.css']
})
export class ClientOrderDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild(OrderHistoryDetailsComponent)
  private orderHistoryDetailsComponent: OrderHistoryDetailsComponent;

  idOrder: any;
  currencyTxUsd: any;
  currencyTx: any;
  companyName: any;
  gateway: string;
  token: any;
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
  link: Array<any>;
  list: object;
  cmd: object;
  idCmd: string;
  id_cmd: string;
  submissionDate: string;
  state: string;
  states: Array<any>;
  discount: number;
  ht: number;
  vat: number;
  total: number;
  fees: number;
  cart: Array<any>;
  item: any;
  invoice: string;
  retryMode: string;
  period: any;
  datasets: object;
  datasetsLink: { L1: string; L1TRADEONLY: string; L2: string; };
  dtOptions: DataTables.Settings = {};
  orderDetails: OrderDetails;
  sales: string;
  type: string;
  proForma: string;
  internalNote: string;
  productsLogs: Array<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private currencyService: CurrencyService,
    private orderService: OrderService,
    private downloadInvoiceService: DownloadInvoiceService,
    private invoiceService: InvoiceService
  ) {
    route.params.subscribe(_ => { this.idCmd = _.id; });
  }
  ngAfterViewInit(): void {
    this.loadOrderDetailsAndLogsAndSetupOrderDetails();
  }


  ngOnInit() {
    this.listCurrencies();
    this.gateway = environment.gateway;
    this.item = false;
    this.cart = [];
    this.symbols = [];
    this.link = [];
    this.message = '';
    this.action = '';
    this.symbol = '';
    this.ht = 0;
    this.vat = 1;
    this.fees = 0;
    this.discount = 0;
    this.total = 0;
    this.state = '';
    this.datasets = {
      L1: 'L1 - Full',
      L1TRADEONLY: 'L1 - Trades',
      L2: 'L2'
    };
    this.datasetsLink = {
      L1: 'L1-Full',
      L1TRADEONLY: 'L1-Trades',
      L2: 'L2'
    };
    // this.token = JSON.parse(sessionStorage.getItem('user')).token;
    this.token = sessionStorage.token;
    this.getListStates();
  }

  detail(c) {
    this.item = c;
    this.loadLogsAndSetupOrderDetails(c);
    if (this.item.onetime === 1) {
      this.item.reference = this.item.idElem;
    }
  }
  cancel() {
    this.item = '';
  }
  update() {
    this.item = '';
  }

  retry() {
    this.orderService.getRetry(this.item.reference, this.retryMode).subscribe(order => {
      this.loadOrderDetailsAndLogsAndSetupOrderDetails();
    });
  }

  getOrderDetailsById(order: any, responseLogs: any) {
    this.currencyService.getCurrencies().subscribe(r => {
      this.symbols = [];
      r.currencies.forEach(s => {
        this.symbols[s.id] = s.symbol;
      });
      this.list = order;
      this.id_cmd = order.id_cmd;
      this.invoice = order.idCommande;
      this.proForma = order.idProForma;
      this.idOrder = order.id;
      this.cmd = order;
      this.companyName = order.companyName;
      this.payment = order.payment;
      this.firstname = order.firstname;
      this.lastname = order.lastname;
      this.job = order.job;
      this.country = order.countryBilling;
      this.currency = order.currency;
      this.discount = order.discount;
      this.currencyTx = order.currencyTx;
      this.currencyTxUsd = order.currencyTxUsd;
      this.totalFees = order.totalExchangeFees;
      this.totalHT = (order.totalHT - (order.totalHT * this.discount / 100)) + this.totalFees;
      this.vat = order.vatValue;
      this.totalVat = this.totalHT * this.vat;
      this.totalTTC = this.totalHT + this.totalVat;
      this.submissionDate = order.submissionDate;
      this.state = order.state;
      this.sales = order.sales;
      this.type = order.type;
      this.internalNote = order.internalNote;
      this.productsLogs = responseLogs.logs;
      let index = 0;
      this.cart = [];
      if (order.products.length > 0) {
        order.products.forEach((product) => {
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
            idCmd: order.id_cmd,
            idElem: product.id_undercmd,
            quotation_level: product.dataset,
            symbol: product.symbol,
            exchange: product.exchangeName,
            assetClass: product.assetClass,
            eid: product.eid,
            qhid: product.qhid,
            description: product.description,
            onetime: product.onetime,
            subscription: product.subscription,
            pricingTier: product.pricingTier,
            period: product.period,
            price: product.price,
            ht: product.ht,
            begin_date_select: product.begin_date,
            begin_date: product.begin_date_ref,
            end_date_select: product.end_date,
            end_date: product.end_date_ref,
            status: product.status,
            links: product.links,
            logs: null
          };
          if (responseLogs !== undefined && Array.isArray(responseLogs.logs)) {
            prod.logs = responseLogs.logs.filter(log => log.id_undercmd === product.id_undercmd);
          }
          this.ht += product.price;
          this.cart.push(prod);
          if (product.backfill_fee > 0 || product.ongoing_fee > 0) {
            this.cart.push({ print: true, backfill_fee: product.backfill_fee, ongoing_fee: product.ongoing_fee });
          }
        });
      }
    });
  }

  listCurrencies() {
    this.currencyService.getCurrencies().subscribe(list => {
      this.symbols = [];
      list.currencies.forEach(item => {
        this.symbols[item.id] = item.symbol;
      });
    });
  }

  confirm() {
    console.dir(this.cmd['email']);
    this.orderService.state({ idCmd: this.id_cmd, status: 'PVP', referer: 'Compliance', email: this.cmd['email'] }).subscribe(() => {
      this.router.navigate(['/compliance/orders']);
    });
  }

  actions(action) {
    this.action = action;
  }

  openModal(content) {
    this.modalService.open(content);
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  dateDiff(date1, date2) {
    let diff = { sec: 0, min: 0, hour: 0, day: 0 };
    let tmp = date2 - date1;
    tmp = Math.floor(tmp / 1000);
    diff.sec = tmp % 60;
    tmp = Math.floor((tmp - diff.sec) / 60);
    diff.min = tmp % 60;
    tmp = Math.floor((tmp - diff.min) / 60);
    diff.hour = tmp % 24;
    tmp = Math.floor((tmp - diff.hour) / 24);
    diff.day = tmp;
    return diff;
  }

  getListStates() {
    this.orderService.getListStates({}).subscribe(res => {
      this.states = res['states'];
    });
  }

  verifState() {
    if (this.state === 'PVC') {
      return true;
    } else {
      return false;
    }
  }

  getStateName(stateId) {
    if (!this.states)
      return stateId;
    return this.states.filter(e => e.id === stateId)[0] ? this.states.filter(e => e.id === stateId)[0].name : stateId;
  }

  downloadInvoice(invoice, pdfType) {
    this.downloadInvoiceService.getInvoice(this.idOrder, invoice, pdfType);
  }

  generateInvoice() {
    this.invoiceService.generateInvoice(this.idOrder).subscribe();
  }

  private loadOrderDetailsAndLogsAndSetupOrderDetails() {
    this.orderService.getSupportOrderDetailsById(this.idCmd).subscribe(order => {
      this.loadLogsAndSetupOrderDetails(order);
    });
  }

  private loadLogsAndSetupOrderDetails(order: any) {
    this.orderService.getSupportLogsOrdersById(this.idCmd).subscribe(responseLogs => {
      this.SetupOrderDetails(order, responseLogs);
    });
  }

  private SetupOrderDetails(order: any, responseLogs: any) {
    this.orderDetails = this.convertOrderToOrderDetails(order);
    this.getOrderDetailsById(this.orderDetails.details, responseLogs);
    // this.orderHistoryDetailsComponent.setOrderDetails(this.orderDetails);  
    this.orderHistoryDetailsComponent.setToken(this.orderDetails.details.token);
  }

  convertOrderToOrderDetails(order) {
    var orderDetails = new OrderDetails(order.details, order.products);
    orderDetails.details.token = order.details.token;
    return orderDetails;
  }

}
