import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { NgbTabChangeEvent, NgbDatepickerConfig, NgbModal, ModalDismissReasons, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '../../../environments/environment';
import { DataService } from '../../data.service';
import { ElasticService } from '../../services/elastic.service';
import { stagger } from '@angular/core/src/animation/dsl';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';

import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { ConfigService } from '../../services/config.service';
import { FluxService } from '../../services/flux.service';

class Product {
  idx: string;
  index: string;
  adtv: string;
  description: string;
  pricingtier: number;
  price: number;
  onetime: number;
  subscription: number;
  constratid: string;
  eid: string;
  symbol: string;
  exchange: string;
  assetClass: string;
  contractid: string;
  mics: Array<any>;
  qhid: string;
  quotation_level: string;
  begin_date: string;
  begin_date_select: string;
  end_date: string;
  end_date_select: string;
  id_cmd: string;
  historical_data: object;
  status: string;
}

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit {
  caddies: Array<object>;
  tabPrice: any;
  ds: string;
  exchangesRef: any;
  assetsRef: any;
  tabPricingTier: any;
  user: object;
  catalogue: object;
  formatfile: string;
  caddy: Array<object>;
  tabsearch: any;
  to: number;
  from: number;
  pageTo: number;
  total: number;
  btnSearch: boolean;
  onetimeTo: NgbDateStruct;
  onetimeFrom: NgbDateStruct;
  runsearch: boolean;
  dataset: any;
  datasets: Array<object>;
  pagesize: any;
  page: number;
  reqSearch: { fields: string[], query: { bool: { must: any[], should: any[], must_not: any[] } }, aggs: object, from: number, size: number, index: any[], type: any[] };
  nbperpage: string;
  nassc: string;
  exchange: string;
  period: { begin_date: string, end_date: string };
  periodSubscription: number;
  options: Array<any>;
  closeResult: string;
  search: string;
  assets: Array<object>;
  nbPerPage: Array<object>;
  exchanges: Array<object>;
  assetsSearch: Array<object>;
  exchangesSearch: Array<object>;
  out: object;
  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct;
  calendar: NgbCalendar;
  toDate: NgbDateStruct;
  minDate: { year: number, month: number, day: number };
  maxDate: { year: number, month: number, day: number };
  // dtOptions: DataTables.Settings = {};
  hits: Array<any>;
  avaibility: boolean;
  addCart: {
    onetime: number,
    complete: number,
    onetimeFrom: string,
    onetimeTo: string,
    subscription: number,
    products: Array<Product>
  };

  // fields search
  all: string;
  symbol: string;
  isin: string;
  mics: string;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private data: DataService,
    private elasticService: ElasticService,
    private userService: UserService,
    private fluxService: FluxService,
    private configService: ConfigService,
    private orderService: OrderService,
    private modalService: NgbModal,
    private calenda: NgbCalendar,
    private config: NgbDatepickerConfig
  ) {
    // this.inputEl;
    // customize default values of datepickers used by this component tree
    config.minDate = { year: 2000, month: 1, day: 1 };
    config.maxDate = { year: 2050, month: 12, day: 31 };

    // days that don't belong to current month are not visible
    config.outsideDays = 'hidden';

    this.avaibility = false;
    this.calendar = calenda;
    this.reset();
    this.options = [];
    this.reqSearch.from = 0;
    this.nbperpage = '10';
    this.btnSearch = true;
    this.total = 0;
    this.addCart = {
      onetime: 0,
      complete: 0,
      onetimeFrom: '',
      onetimeTo: '',
      subscription: 0,
      products: []
    };
  }

  @ViewChild("runsearch")
  private inputEl: ElementRef;

  ngAfterViewInit(){
    this.inputEl.nativeElement.focus();
  }

  ngOnInit() {
    // this.inputEl;
    this.dataset = JSON.parse(sessionStorage.getItem('dataset'));
    if (!this.dataset || !this.dataset.hasOwnProperty('dataset')) {
      this.router.navigateByUrl('/');
    } else {
      this.getCatalogue();
    }
    this.search = this.dataset.title;
    this.user = JSON.parse(sessionStorage.getItem('user'));
    this.getInfoUser(this.user['token']);
    this.getCaddy(this.user['_id']);
    this.exchanges = [];
    this.assets = [];
    this.tabsearch = 'instrument';
    this.formatfile = 'csv';
    // this.getCaddie();
    this.getShowEntries();
    this.getPeriod();
    this.getPricingTier();
    this.getPrice();
    this.datasets = [
      { id: 'L1TRADEONLY', name: 'L1 - Trades', search: 'Find Times & Sales' },
      { id: 'L1', name: 'L1 - Full', search: 'Find Top of Book' },
      { id: 'L2', name: 'L2', search: 'Find L2-MBL' }
    ];
    // this.data.currentSearch.subscribe(search => this.search = search);
  }
  resetSelect(){
    this.hits.forEach(hit=>{
      hit.selected = false;
    });
    this.addCart = {
      onetime: 0,
      complete: 0,
      onetimeFrom: '',
      onetimeTo: '',
      subscription: 0,
      products: []
    };
  }
  setDataset(e) {
    this.reset();
    let dtst = this.searchDataset(e, this.datasets);
    sessionStorage.setItem('dataset', JSON.stringify({ dataset: dtst.id, title: dtst.name }));
    this.data.changeSearch(dtst.search);
    this.search = dtst.search
    this.getCatalogue();
  }

  getCatalogue() {
    this.ds = '';
    if (this.dataset.dataset === 'L1TRADEONLY') { this.ds = 'Trades'; }
    if (this.dataset.dataset === 'L1') { this.ds = 'L1'; }
    if (this.dataset.dataset === 'L2') { this.ds = 'MBL'; }
    this.fluxService.catalogue(this.ds).subscribe(res => {
      this.catalogue = res;
      this.getAssetExchange();
    });
  }

  rSearch() {
    this.btnSearch = false;
    this.page = 0;
    this.getSearch();
  }

  getPeriod() {
    this.configService.getPeriod().subscribe(res => {
      this.periodSubscription = res[0].value;
    });
  }

  verifPricingTier(index, adtv): number {
    let val = 1;
    this.tabPricingTier.forEach(pt => {
      if(index === environment.elastic.instrument.derivatives) {
        if (pt.pricingTier === 1 && pt.sup <= adtv) {
          val = 1;
        } else if (pt.pricingTier === 2 && pt.inf > adtv) {
          val = 2;
        }
      }
      if(index === environment.elastic.instrument.nonderivatives) {
        if (pt.pricingTier === 3 && pt.sup <= adtv) {
          val = 3;
        } else if (pt.pricingTier === 4 && pt.inf > adtv) {
          val = 4;
        }
      }
    });
    return val;
  }

  getInfoUser(token){
    let field = [
      'id',
      'token',
    ];
    this.userService.info({token: token, field: field}).subscribe(res=>{
      this.user = res.user;
    });
  }

  getCaddy(iduser){
    this.orderService.getCaddies({id: iduser}).subscribe((c) => {
      this.caddies = [];
      if(c.cmd.length > 0 ) {
        c.cmd.forEach((cmd) => {
          cmd.products.forEach((p) => {
            let prod = {
              id: p.idx,
              quotation_level: p.dataset,
              description: p.description,
              onetime: p.onetime,
              subscription: p.subscription,
              begin_date_select: p.begin_date,
              bdref: this.dateNGB(p.begin_date_ref),
              begin_date: p.begin_date_ref,
              bds: this.dateNGB(p.begin_date),
              end_date_select : p.end_date,
              end_date : p.end_date_ref,
              edref : this.dateNGB(p.end_date_ref),
              eds : this.dateNGB(p.end_date)
            };
            this.caddies.push(prod);
          });
        });
      }
    });
  }

  // getCaddie(){
  //   this.orderService.getIdOrder(this.user['_id']).subscribe(p=>{
  //     this.caddy = p;
  //   });
  // }

  getPrice() {
    this.fluxService.pricingTier().subscribe(res => {
      this.tabPrice = res;
    });
  }

  getPricingTier() {
    if (this.tabsearch === 'instrument') {
      this.configService.getPricingTier().subscribe(res => {
        this.tabPricingTier = res[0].tab;
      });
    }
  }

  getAssetExchange() {
    let q = {};
    if (this.tabsearch === 'instrument') {
      q['index'] = environment.elastic.instrument.index;
      q['type'] = environment.elastic.instrument.type;
    }
    if (this.tabsearch === 'feed') {
      q['index'] = environment.elastic.feed.index;
      q['type'] = environment.elastic.feed.type;
    }
    q['fields'] = [];
    q['query'] = {
      "bool": {
        "should": [
          {
            "terms": {
              "EID": this.catalogue['tabEid']
            }
          },
          {
            "terms": {
              "ContractEID": this.catalogue['tabEid']
            }
          }
        ]
      }
    };
    q["aggs"] = {
      "exchanges": {
        "terms": {
          "size": 1000,
          "field": "ExchangeName"
        }
      },
      "exchangesLong": {
        "terms": {
          "size": 1000,
          "script": "doc['ExchangeName'].values + '§' + doc['ExchangeLongName'].values"
          // "field": "ExchangeLongName"
        }
      },
      // "exchange_agg": {
      //   "terms": {
      //     "field": "ContractExchange"
      //   }
      // },
      "assets": {
        "terms": {
          "size": 1000,
          "field": "AssetClass"
        }
      }//,
      // "assets_agg": {
      //   "terms": {
      //     "field": "ContractAssetClass"
      //   }
      // }
    };
    q['from'] = 0;
    q['size'] = 1;
    this.elasticService.getSearch(q).subscribe(resp => {
      this.getAsset(resp.aggregations.assets.buckets);
      this.getExchangesBis(resp.aggregations.exchanges.buckets, resp.aggregations.exchangesLong.buckets);
      // this.getExchanges(resp.aggregations.exchanges.buckets);
    });
  };

  getAsset(assets) {
    this.assets = [];
    // this.fluxService.getAssets().subscribe(flux => {
      // this.assetsRef = flux;
      assets.forEach(a => {
        // if (a.key !== '' && this.assetsRef.find(x => x.id === a.key)) {
          // this.assets.push({ id: a.key, name: this.assetsRef.find(x => x.id === a.key).name });
          this.assets.push({ id: a.key, name: a.key });
        // }
      });
    // });
  }

  getExchanges(exchange) {
    this.exchanges = [];
    this.fluxService.getExchanges().subscribe(flux => {
      this.exchangesRef = flux;
      exchange.forEach(a => {
        if (a.key !== '' && this.exchangesRef.find(x => x.id === a.key)) {
          this.exchanges.push({ id: a.key, name: this.exchangesRef.find(x => x.id === a.key).name });
        }
      });
    });
  }

  getExchangesBis(exchange, exchangeLong) {
    this.exchanges = [];
    exchangeLong.forEach((a, i) => {
      // let key = a.key.replace(/['"]+/g, '');
      // let keyLong = exchangeLong[i].key.replace(/['"]+/g, '');
      let key = a.key.split('§');
      // let exch = this.searchExchangeName(key, this.catalogue['catalogue']);
      // if (a.key !== '' && exch && exch.desc === key) {
      //   this.exchanges.push({ id: key, name: exch.name });
      // }
      this.exchanges.push({ id: key[0].replace('[','').replace(']',''), name: key[1].replace('[','').replace(']','') });
    });
    this.exchanges.sort( function(a, b){
      if(a['name'].toUpperCase() < b['name'].toUpperCase()) {
        return -1;
      }
      if(a['name'].toUpperCase() > b['name'].toUpperCase()) {
        return 1;
      }
      return 0;
    });
  }
  getSearch() {
    if (this.tabsearch === 'instrument') {
      this.reqSearch.index = environment.elastic.instrument.index;
      this.reqSearch.type = environment.elastic.instrument.type;
    }
    if (this.tabsearch === 'feed') {
      this.reqSearch.index = environment.elastic.feed.index;
      this.reqSearch.type = environment.elastic.feed.type;
    }
    let fields = [];
    let must = [];
    this.reqSearch.aggs = {};
    this.reqSearch.query.bool.must = [];
    let should = [];

    fields = [
      'Code',
      'ContractID',
      'EID',
      'ContractEID',
      'AssetClass',
      'ContractEID',
      'Description',
      'ContractDescription',
      'Symbol',
      'ContractSymbol',
      'ExchangeName',
      'ContractExchange',
      'ISIN',
      'ContractISIN',
      'AvailabilityStart',
      'AvailabilityEnd',
      'Availability',
      'ContractAvailability',
      'ContractAssetClass',
      'ADTV',
      'Constituents',
      'MICs',
      'ContractADTV'
    ];

    if (this.all !== '') {
      // this.all = this.all.replace(/\s/g,'');
      let alltemp = this.all.trim().split(" ");
      let allreq = '';
      alltemp.forEach(al=>{
        allreq += ' +"' + al + '"';
      })
      let shouldall = [];

      if (this.symbol === '') {
        shouldall.push({
          'bool': {
            "should": [
              {
                "query_string": {
                  "default_field": "Symbol",
                  "query": allreq
                }
              },
              // {
              //   'wildcard': {
              //     'Symbol': {
              //       'value': allreq + '*'
              //     }
              //   }
              // },
              {
                "query_string": {
                  "default_field": "ContractSymbol",
                  "query": allreq
                }
              }
              // {
              //   'wildcard': {
              //     'ContractSymbol': {
              //       'value': allreq + '*'
              //     }
              //   }
              // }
            ]
          }
        });
      }
      shouldall.push({
        'bool': {
          "should": [
            {
              "query_string": {
                "default_field": "Description",
                "query": allreq
              }
              // 'wildcard': {
              //   'Description': {
              //     'value': '*' + allreq.toLowerCase() + '*'
              //   }
            // }
            },
            {
              "query_string": {
                "default_field": "ContractDescription",
                "query": allreq
              }
              // 'wildcard': {
              //   'ContractDescription': {
              //     'value': '*' + allreq.toLowerCase() + '*'
              //   }
              // }
            }
          ]
        }
      });
      shouldall.push({
        "query_string": {
          "default_field": "LocalCodeStr",
          "query": allreq
        }
        // 'wildcard': {
        //   'LocalCodeStr': {
        //     'value': '*' + allreq + '*'
        //   }
        // }
      });
      this.reqSearch.query.bool.must.push({
        'bool': {
          'should': shouldall
        }
      });
    }
    if (this.symbol !== '') {
      // this.symbol = this.symbol.replace(/\s/g,'');
      this.symbol = this.symbol.trim();
      this.reqSearch.query.bool.must.push({
        'bool': {
          "should": [
            {
              'wildcard': {
                'Symbol': {
                  'value': this.symbol.toUpperCase() + '*'
                }
              }
            },
            {
              'wildcard': {
                'ContractSymbol': {
                  'value': this.symbol.toUpperCase() + '*'
                }
              }
            }
          ]
        }
      });
    }
    if (this.isin !== '') {
      // this.isin = this.isin.replace(/\s/g,'');
      this.isin = this.isin.trim();
      this.reqSearch.query.bool.must.push({
        'wildcard': {
          'ISIN': {
            'value': this.isin.toUpperCase() + '*'
          }
        }
      });
    }
    if (this.mics !== '') {
      // this.mics = this.mics.replace(/\s/g,'');
      this.mics = this.mics.trim();
      this.reqSearch.query.bool.must.push({
        'wildcard': {
          'MICs': {
            'value': this.mics + '*'
          }
        }
      });
    }

    if (this.assetsSearch.length > 0) {
      this.reqSearch.query.bool.must.push({
        'bool': {
          "should": [
            { 'terms': { 'AssetClass': this.assetsSearch } },
            { 'terms': { 'ContractAssetClass': this.assetsSearch } }
          ]
        }
      });
    }
    if (this.exchangesSearch.length > 0) {
      this.reqSearch.query.bool.must.push({
        "bool": {
          "should": [
            { 'terms': { 'ExchangeName': this.exchangesSearch } },
            { 'terms': { 'ContractExchange': this.exchangesSearch } },
            { 'terms': { 'ExchangeName': this.exchangesSearch } }
          ]
        }
      });
    }
    this.reqSearch.query.bool.must.push({
      "bool": {
        "should": [
          { 'terms': { 'EID': this.catalogue['tabEid'] } },
          { "terms": { "ContractEID": this.catalogue['tabEid'] }
          }
        ]
      }
    });

    this.reqSearch.fields = fields;
    this.out = this.reqSearch;
    if(this.all !=='' || this.symbol !== '' || this.isin !== '' || this.mics !== '' || this.exchangesSearch.length > 0 || this.assetsSearch.length > 0){
      this.elasticService.getSearch(this.reqSearch).subscribe(resp => {
        this.hits = [];
        resp.hits.hits.forEach(hit => {
          hit['selected'] = false;
          this.hits.push(hit);
        });
        this.total = resp.hits.total;
        this.pagesize = resp.hits.total - parseInt(this.nbperpage, 10);
        if (this.pagesize <= 0) {
          this.from = 1;
          this.to = this.total;
        }
      });
    }
  };

  reset() {
    this.nbperpage = '10';
    this.pagesize = 0;
    this.page = 0;
    this.total = 0;
    this.from = 0;
    this.to = 0;
    this.reqSearch = { fields: [], query: { bool: { must: [], should: [], must_not: [] } }, aggs: {}, from: 0, size: parseInt(this.nbperpage, 10), index: [], type: [] };
    this.all = '';
    this.symbol = '';
    this.isin = '';
    this.mics = '';
    this.exchange = '';
    this.nassc = '';
    this.assetsSearch = [];
    this.exchangesSearch = [];
    this.hits = [];
    this.options = [];
    this.addCart = {
      onetime: 0,
      complete: 0,
      onetimeFrom: '',
      onetimeTo: '',
      subscription: 0,
      products: []
    };
    this.avaibility = false;
    // this.btnFocus();
  };

  addnbperpage(e) {
    this.page = 0;
    this.nbperpage = e;
    this.to = parseInt(this.nbperpage, 10);
    this.reqSearch.size = parseInt(this.nbperpage, 10);
    this.getSearch();
  };

  updPagination() {
    this.pageTo = parseInt(this.nbperpage, 10);
    this.from = ((this.page - 1) * this.pageTo) + 1;
    this.reqSearch.from = (this.page - 1) * this.pageTo;
    if ((this.reqSearch.from + this.pageTo) > this.total) {
      this.to = this.total
    } else {
      this.to = this.page * this.pageTo;
    }
    if (this.btnSearch) {
      this.getSearch();
    } else {
      this.btnSearch = true;
    }
  };

  addAsset(e) {
    this.assetsSearch.push(e);
    this.inputEl.nativeElement.focus();
  };

  addEchange(e) {
    this.exchangesSearch.push(e);
    this.inputEl.nativeElement.focus();
  };
  btnFocus(){
    this.inputEl.nativeElement.focus();
  }
  getShowEntries() {
    this.nbPerPage = [
      { id: '5', name: '5' },
      { id: '10', name: '10' },
      { id: '25', name: '25' },
      { id: '50', name: '50' },
      { id: '100', name: '100' }
    ];
  };

  delEx(e) {
    this.exchangesSearch.splice(this.exchangesSearch.indexOf(e), 1);
    this.inputEl.nativeElement.focus();
  }
  delAs(a) {
    this.assetsSearch.splice(this.assetsSearch.indexOf(a), 1);
    this.inputEl.nativeElement.focus();
  }
  datePeriod() {
    this.addCart.complete = 0;
  }
  dateComplete() {
    this.addCart.complete = 1;
    this.addCart.onetimeFrom = '';
    this.addCart.onetimeTo = '';
    this.addCart.products.forEach((p, i) => {
      this.addCart.products[i].begin_date_select = this.addCart.products[i].begin_date;
      this.addCart.products[i].end_date_select = this.addCart.products[i].end_date;
    });
  }
  dateChangeBegin(date) {
    this.addCart.complete = 0;
    if (date) {
      let selectdate = new Date(date.year + '-' + date.month + '-' + date.day);
      this.addCart.products.forEach((p, i) => {
        let bd = new Date(p.begin_date);
        let ed = new Date(p.end_date);
        if (bd <= selectdate) {
          if (ed >= selectdate) {
            this.addCart.products[i].begin_date_select = date.year + '-' + date.month + '-' + date.day;
          } else {
            this.addCart.products[i].begin_date_select = p.end_date;
          }
        }
      });
    }
  }
  dateChangeEnd(date) {
    this.addCart.complete = 0;
    if (date) {
      let selectdate = new Date(date.year + '-' + date.month + '-' + date.day);
      this.addCart.products.forEach((p, i) => {
        let ed = new Date(p.end_date);
        let bd = new Date(p.begin_date);
        if (ed >= selectdate) {
          if(bd <= selectdate) {
            this.addCart.products[i].end_date_select = date.year + '-' + date.month + '-' + date.day;
          } else {
            this.addCart.products[i].end_date_select = p.begin_date;
          }
        }
      });
    }
  }


  dateChangeFrom() {
    let convOneTimeFrom = new Date();
    let convOneTimeTo = new Date();
    let convOneTimeFromMin = new Date();

    convOneTimeFrom = new Date(this.onetimeFrom.year, this.onetimeFrom.month - 1, this.onetimeFrom.day);
    convOneTimeFromMin = new Date(this.minDate.year, this.minDate.month - 1, this.minDate.day);
    convOneTimeTo = new Date(this.onetimeTo.year, this.onetimeTo.month - 1, this.onetimeTo.day);

    if(convOneTimeFrom > convOneTimeTo) {
      this.onetimeFrom = { year: convOneTimeTo.getFullYear(), month: convOneTimeTo.getMonth() + 1, day: convOneTimeTo.getDate() };
    }
    if(convOneTimeFrom < convOneTimeFromMin) {
      this.onetimeFrom = { year: convOneTimeFromMin.getFullYear(), month: convOneTimeFromMin.getMonth() + 1, day: convOneTimeFromMin.getDate() };
    }
    this.addCart.onetimeFrom = this.onetimeFrom.year + '-' + this.onetimeFrom.month  + '-' + this.onetimeFrom.day;
    this.dateChangeBegin(this.onetimeFrom);
  }

  dateChangeTo() {
    let convOneTimeFrom = new Date();
    let convOneTimeTo = new Date();
    let convOneTimeToMax = new Date();

    convOneTimeFrom = new Date(this.onetimeFrom.year, this.onetimeFrom.month - 1, this.onetimeFrom.day);
    convOneTimeTo = new Date(this.onetimeTo.year, this.onetimeTo.month - 1, this.onetimeTo.day);
    convOneTimeToMax = new Date(this.maxDate.year, this.maxDate.month - 1, this.maxDate.day);

    if(convOneTimeFrom > convOneTimeTo) {
      this.onetimeTo = { year: convOneTimeFrom.getFullYear(), month: convOneTimeFrom.getMonth() + 1, day: convOneTimeFrom.getDate() };
    }
    if(convOneTimeTo > convOneTimeToMax) {
      this.onetimeTo = { year: convOneTimeToMax.getFullYear(), month: convOneTimeToMax.getMonth() + 1, day: convOneTimeToMax.getDate() };
    }
    this.addCart.onetimeTo = new Date (this.onetimeTo.year + '-' + this.onetimeTo.month  + '-' + this.onetimeTo.day).toJSON();
    this.dateChangeEnd(this.onetimeTo);
  }

  updtCheck(option, event) {
    if (event.target.checked) {
      let product = new Product();
      product.index = option._index;
      product.idx = option._id;
      this.fluxService.infoProduct(option._source.EID).subscribe(eid=>{
        product.historical_data = eid.historical_data;
        product.contractid = '';
        if (option._index === environment.elastic.feed.productdb) { // FEED
          let av0 = new Date(option._source.AvailabilityStart);
          let av1 = new Date(option._source.AvailabilityEnd);

          if (this.addCart.products.length === 0) {
            this.minDate = { year: av0.getFullYear(), month: (av0.getMonth()+1), day: av0.getDate() };
            this.config.minDate = this.minDate;
            this.maxDate = { year: av1.getFullYear(), month: (av1.getMonth()+1), day: av1.getDate() };
            this.config.maxDate = this.maxDate;
          } else {
            if (av0 < new Date(this.minDate.year + '-' + this.minDate.month + '-' + this.minDate.day)) {
              this.minDate = { year: av0.getFullYear(), month: (av0.getMonth()+1), day: av0.getDate() };
              this.config.minDate = this.minDate;
            }
            if (av1 > new Date(this.maxDate.year + '-' + this.maxDate.month + '-' + this.maxDate.day)) {
              this.maxDate = { year: av1.getFullYear(), month: (av1.getMonth()+1), day: av1.getDate() };
              this.config.maxDate = this.maxDate;
            }
          }
          product.contractid = '';
          product.qhid = '';
          product.description = this.catalogue['catalogue'][ this.catalogue['tabEid'].indexOf(option._source.EID.toString()) ].name;
          product.pricingtier = 1;
          product.eid = option._source.EID;
          product.quotation_level = this.dataset.dataset;
          product.exchange = option._source.ExchangeName;
          product.assetClass = '';
          product.symbol = '';
          product.begin_date = av0.toJSON();
          product.begin_date_select = av0.toJSON();
          product.end_date = av1.toJSON();
          product.end_date_select = av1.toJSON();
          product.id_cmd = '';
        }
        if (option._index === environment.elastic.instrument.nonderivatives) { // Instrument non-deriv
          let av0 = new Date(option._source.AvailabilityStart);
          let av1 = new Date(option._source.AvailabilityEnd);

          if (this.addCart.products.length === 0) {
            this.minDate = { year: av0.getFullYear(), month: (av0.getMonth()+1), day: av0.getDate() };
            this.config.minDate = this.minDate;
            this.maxDate = { year: av1.getFullYear(), month: (av1.getMonth()+1), day: av1.getDate() };
            this.config.maxDate = this.maxDate;
          } else {
            if (av0 < new Date(this.minDate.year + '-' + this.minDate.month + '-' + this.minDate.day)) {
              this.minDate = { year: av0.getFullYear(), month: (av0.getMonth()+1), day: av0.getDate() };
              this.config.minDate = this.minDate;
            }
            if (av1 > new Date(this.maxDate.year + '-' + this.maxDate.month + '-' + this.maxDate.day)) {
              this.maxDate = { year: av1.getFullYear(), month: (av1.getMonth()+1), day: av1.getDate() };
              this.config.maxDate = this.maxDate;
            }
          }
          product.adtv = option._source.ADTV;
          if (this.tabsearch === 'instrument') {
            product.pricingtier = this.verifPricingTier(option._index, option._source.ADTV);
          }
          if (this.tabsearch === 'feed') {
            product.pricingtier = option._source.ContractPricingTier;//Voir QuantFlow
          }
          product.contractid = option._source.ContractID;
          // product.pricingtier = option._source.PricingTier;
          product.qhid = option._source.Code;
          product.eid = option._source.EID;
          product.description = option._source.Description;
          product.quotation_level = this.dataset.dataset;
          product.exchange = option._source.ExchangeName;
          product.assetClass = option._source.AssetClass;
          product.symbol = option._source.Symbol;
          product.begin_date = av0.toJSON();
          product.begin_date_select = av0.toJSON();
          product.end_date = av1.toJSON();
          product.end_date_select = av1.toJSON();
          product.id_cmd = '';
        }
        if (option._index === environment.elastic.instrument.derivatives) { // Instrument deriv
          let av0 = new Date(option._source.AvailabilityStart);
          let av1 = new Date(option._source.AvailabilityEnd);

          if (this.addCart.products.length === 0) {
            this.minDate = { year: av0.getFullYear(), month: (av0.getMonth()+1), day: av0.getDate() };
            this.config.minDate = this.minDate;
            this.maxDate = { year: av1.getFullYear(), month: (av1.getMonth()+1), day: av1.getDate() };
            this.config.maxDate = this.maxDate;
          } else {
            if (av0 < new Date(this.minDate.year + '-' + this.minDate.month + '-' + this.minDate.day)) {
              this.minDate = { year: av0.getFullYear(), month: (av0.getMonth()+1), day: av0.getDate() };
              this.config.minDate = this.minDate;
            }
            if (av1 > new Date(this.maxDate.year + '-' + this.maxDate.month + '-' + this.maxDate.day)) {
              this.maxDate = { year: av1.getFullYear(), month: (av1.getMonth()+1), day: av1.getDate() };
              this.config.maxDate = this.maxDate;
            }
          }
          product.contractid = option._source.ContractID;
          // product.adtv = option._source.ContractADTV;
          product.adtv = option._source.ADTV;
          if (this.tabsearch === 'instrument') {
            // product.pricingtier = this.verifPricingTier(option._source.ContractADTV);
            product.pricingtier = this.verifPricingTier(option._index, option._source.ADTV);
          }
          if (this.tabsearch === 'feed') {
            product.pricingtier = option._source.ContractPricingTier;//Voir QuantFlow
          }
          // product.pricingtier = option._source.ContractPricingTier;
          // product.qhid = option._source.QHID;
          product.description = '';
          product.qhid = '';
          product.mics = option._source.MICs;
          // product.eid = option._source.ContractEID;
          product.eid = option._source.EID;
          product.quotation_level = this.dataset.dataset;
          // product.exchange = option._source.ContractExchange;
          product.exchange = option._source.ExchangeName;
          product.assetClass = option._source.AssetClass;
          // product.symbol = option._source.ContractSymbol;
          product.symbol = option._source.Symbol;
          product.begin_date = av0.toJSON();
          product.end_date = av1.toJSON();
          product.begin_date_select = av0.toJSON();
          product.end_date_select = av1.toJSON();
          product.id_cmd = '';
        }
        product.status = 'validated';
        this.addCart.products.push(product);
      });
    } else {
      this.addCart.products.splice(this.addCart.products.indexOf(option), 2);
    }
  }

  getAvailability(db, ed) {
    this.avaibility = true;

    let dd = new Date(db);
    let df = new Date(ed);
    let toFro = this.calendar.getToday();
    toFro.day = dd.getDate();
    toFro.month = dd.getMonth() + 1;
    toFro.year = dd.getFullYear();
    let toDat = this.calendar.getToday();
    toDat.day = df.getDate();
    toDat.month = df.getMonth() + 1;
    toDat.year = df.getFullYear();

    this.fromDate = this.calendar.getPrev(toFro, 'd', 0);
    this.toDate = this.calendar.getNext(toDat, 'd', 0);
  }

  close() {
    this.avaibility = false;
  }

  product(prd, onetime, subscription) {
    let prod = {};
    let diff = this.dateDiff(new Date(prd.begin_date_select), new Date(prd.end_date_select));
    prod['idx'] = prd.idx;
    prod['index'] = prd.index;
    prod['contractid'] = prd.contractid;
    prod['description'] = prd.description;
    prod['qhid'] = prd.qhid;
    prod['eid'] = prd.eid;
    prod['quotation_level'] = prd.quotation_level;
    prod['exchange'] = prd.exchange;
    prod['assetClass'] = prd.assetClass;
    prod['mics'] = prd.mics;
    prod['symbol'] = prd.symbol;
    prod['begin_date'] = prd.begin_date;
    prod['begin_date_select'] = prd.begin_date_select;
    prod['end_date'] = prd.end_date;
    prod['end_date_select'] = prd.end_date_select;
    prod['id_cmd'] = prd.id_cmd;
    prod['historical_data'] = prd.historical_data;
    if (prd.historical_data.backfill_fee && prd.historical_data.backfill_applyfee && onetime === 1 && !prd.historical_data.direct_billing) {
    // if (prd.historical_data.backfill_fee && prd.historical_data.backfill_applyfee && onetime === 1) {
      prod['backfill_fee'] = prd.historical_data.backfill_fee;
    } else {
      prod['backfill_fee'] = 0;
    }
    if (prd.historical_data.ongoing_fee && prd.historical_data.ongoing_applyfee && subscription === 1 && !prd.historical_data.direct_billing) {
    // if (prd.historical_data.ongoing_fee && prd.historical_data.ongoing_applyfee && subscription === 1) {
      prod['ongoing_fee'] = prd.historical_data.ongoing_fee;
    } else {
      prod['ongoing_fee'] = 0;
    }
    prod['status'] = prd.status;
    prod['price'] = prd.price;
    if (onetime === 1) {
      if(diff.day < 20){ diff.day = 19; }
      prod['ht'] = (diff.day + 1) * prd.price;
    } else if(subscription === 1){
      prod['ht'] = this.periodSubscription * parseInt(prd.price);
    }
    prod['pricingTier'] = prd.pricingtier;
    prod['onetime'] = onetime;
    prod['subscription'] = subscription;
    if (subscription === 1) {
      prod['period'] = this.periodSubscription;
    } else {
      prod['period'] = diff.day + 1;
    }
    return prod;
  }

  save() {
    let caddy = [];
    let prod = {};
    if (this.addCart.onetime === 1) {
      this.addCart.products.forEach((prd) => {
        if(this.tabsearch === 'instrument') {
          prd.price = this.tabPrice.instrument.day[prd.pricingtier][this.ds];
        }
        if(this.tabsearch === 'feed') {
          prd.price = this.tabPrice.feed.day[prd.pricingtier][this.ds];
        }
        prod = this.product(prd, this.addCart.onetime, 0);
        if(!this.verifExist(prod)) { caddy.push(prod); }
      });
    }
    if (this.addCart.subscription === 1) {
      this.addCart.products.forEach((p) => {
        if(this.tabsearch === 'instrument') {
          p.price = this.tabPrice.instrument.month[p.pricingtier][this.ds];
        }
        if(this.tabsearch === 'feed') {
          p.price = this.tabPrice.feed.month[p.pricingtier][this.ds];
        }
        prod = this.product(p, 0, this.addCart.subscription);
        if(!this.verifExist(prod)) {
          prod['begin_date_select'] = '';
          prod['end_date_select'] = '';
          caddy.push(prod);
        }
      });
    }
    this.userService.getCompte(this.user['_id']).subscribe((u) => {
      this.orderService.getIdCmd(this.user['_id']).subscribe((idcmd) => {
        sessionStorage.setItem('cart', JSON.stringify(idcmd));
        this.orderService.updateOrder({ state: "CART", idcmd, u, cart: caddy }).subscribe((res) => {
          this.resetSelect();
        });
      })
    })
  }

  verifExist(p) {
    let resp = false;
    if (this.caddies.length > 0) {
      this.caddies.forEach(cp=>{
        if( p.quotation_level === cp['quotation_level'] &&
            p.idx === cp['id']  &&
            p.onetime === cp['onetime'] &&
            p.subscription === cp['subscription']
        ) {
          if(p.subscription === 1) {
            resp = true;
          } else {
            if (p.onetime === 1 && p.begin_date_select === cp['begin_date_select'] && p.end_date_select === cp['end_date_select'] ) {
              resp = true;
            }
          }
        }
      });
    }
    return resp;
  }

  addCaddies() {
    let c = [];
    if (c = JSON.parse(sessionStorage.getItem('cart'))) {
      this.addCart.products.forEach((prd) => {
        prd.onetime = this.addCart.onetime;
        prd.subscription = this.addCart.subscription;
        c.push(prd);
      });
      sessionStorage.setItem('cart', JSON.stringify(c));
    } else {
      c = [];
      this.addCart.products.forEach((prd) => {
        prd.onetime = this.addCart.onetime;
        prd.subscription = this.addCart.subscription;
        c.push(prd);
      });
      sessionStorage.setItem('cart', JSON.stringify(c));
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  onDateChange(date: NgbDateStruct) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  open(content) {
    this.addCart.onetimeFrom = this.minDate.year + '-' + this.minDate.month  + '-' + this.minDate.day;
    this.addCart.onetimeTo = this.maxDate.year + '-' + this.maxDate.month  + '-' + this.maxDate.day;
    // if(!this.onetimeFrom) {
      this.onetimeFrom = this.minDate;
    // }
    // if(!this.onetimeTo) {
      this.onetimeTo = this.maxDate;
    // }
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  public beforeChange($event: NgbTabChangeEvent) {
    this.tabsearch = $event.nextId;
    this.getPricingTier();
    this.getAssetExchange();
  };

  onetimeCheckbox(element: HTMLInputElement): void {
    if (element.checked) {
      this.addCart.onetime = 1;
    } else {
      this.addCart.onetime = 0;
    }
  }

  subscriptionCheckbox(element: HTMLInputElement): void {
    if (element.checked) {
      this.addCart.subscription = 1;

    } else {
      this.addCart.subscription = 0;
    }
  }
  isString(val) { return typeof val === 'string'; }
  isNumber(val) { return typeof val === 'number'; }

  dateDiff(date1, date2){
    let diff = { sec: 0, min: 0, hour:0, day: 0 };
    let tmp = date2 - date1;
    tmp = Math.floor(tmp/1000);
    diff.sec = tmp % 60;
    tmp = Math.floor((tmp-diff.sec)/60);
    diff.min = tmp % 60;
    tmp = Math.floor((tmp-diff.min)/60);
    diff.hour = tmp % 24;
    tmp = Math.floor((tmp-diff.hour)/24);
    diff.day = tmp;
    return diff;
  }

  dateNGB(d) {
    let dm = this.calenda.getToday();
    let dsplit = d.split('-');
    dm.year = parseInt(dsplit[0]);
    dm.month = parseInt(dsplit[1]);
    dm.day = parseInt(dsplit[2]);
    return dm;
  }

  objectToArray(a) {
    let t = [];
    for (let key in a) {
      t.push(a[key]);
    }
    return t;
  }

  searchDataset(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].id === nameKey) {
            return myArray[i];
        }
    }
  }
  searchExchangeName(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].desc === nameKey) {
            return myArray[i];
        }
    }
  }
  objectToArrayAss(a) {
    let t = [];
    a.forEach(element => {
      for (let key in element) {
        t[key] = a[key];
      }
    });
  }
}
