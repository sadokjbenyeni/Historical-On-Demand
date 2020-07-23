import { Component, OnInit } from '@angular/core';

import { PdfService } from '../../../services/pdf.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})

export class TermsComponent implements OnInit {
  constructor(
    private pdfService: PdfService
  ) { }

  ngOnInit() {}

  link(){
    this.pdfService.pdf({id:225}).subscribe(res=>{
      console.log(res.file);
    });
  }
}