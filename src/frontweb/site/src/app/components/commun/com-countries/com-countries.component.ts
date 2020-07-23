// import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Http, Response } from '@angular/http';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/map';

import { DataTableDirective } from 'angular-datatables';

import { CountriesService } from '../../../services/countries.service';

import { environment } from '../../../../environments/environment';


class DataTablesResponse {
  countries: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

class Countries {
  _id: string;
  id: string;
  name: string;
  ue: boolean;
}

@Component({
  selector: 'app-com-countries',
  templateUrl: './com-countries.component.html',
  styleUrls: ['./com-countries.component.css']
})
export class ComCountriesComponent implements OnInit {

  clickable: boolean;
  copyCountry: any;
  row: string;
  message: string;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};
  countries: Countries[] = [];

  constructor(
    private http: Http,
    private router: Router,
    private httpc: HttpClient,
    private countriesService: CountriesService
  ) { }

  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;
  private countriesForm: NgForm;

  ngOnInit() {
    this.message = '';
    this.dtOptions = {};
    const that = this;
    this.clickable = true;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.httpc
        .post<DataTablesResponse>(environment.api + '/countries', dataTablesParameters, {})
        .subscribe(res => {
          that.countries = res.countries;
          callback({
            recordsTotal: res.recordsTotal,
            recordsFiltered: res.recordsFiltered,
            data: [],
          });
        });
      },
      columns: [ { data: 'id' }, { data: 'name' }, { data: 'ue'} ]
    };
  }

  detail(c){
    if (this.clickable) {
      this.clickable = false;
      this.copyCountry = JSON.parse(JSON.stringify(c));
      this.row = c._id;
    }
  }

  cancel(i){
    this.clickable = true;
    this.countries[i] = this.copyCountry;
    this.row = '';
  }

  save(c){
    this.clickable = true;
    this.countriesService.saveUE(c).subscribe(res=>{
      this.message = res.message;
      this.row = '';
      setTimeout(() => { this.message = ''; }, 5000);
    });
  }

  onKey(event: any, col: number) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(event.target.value).draw();
    })
  }

  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }

}
