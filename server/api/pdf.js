// import { Injectable } from '@angular/core';

// import { environment } from '../../environments/environment';

// import { UploadService } from './upload.service';

// import * as pdfMake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';

export class PdfService {
  cmd: any;
  totalTTC: number;
  totalVat: number;
  totalHt: number;
  orders: [{idx: string, description: string, period: string, begin_date_select: string, end_date_select: string, ht: number, vat: number}];
  iban: string;
  delay: any;
  bic: any;
  bankName: any;
  vatBeneficiary: string;
  rcsBeneficiary: string;
  capitalBeneficiary: string;
  countryBeneficiary: string;
  cityBeneficiary: string;
  cpBeneficiary: string;
  addressBeneficiary: string;
  beneficiaire: string;
  vat: any;
  private pagecurrent: string;
  private pagecount: string;

  // Header
  private numInvoice: string;
  private numAccount: string;
  private idTax: number;
  private invoiceDate: string;
  private paymentDate: string;
  private numCmd: string;
  private currency: string;

  // Billing Address
  private companyName: string;
  private address: string;
  private cp: string;
  private city: string;
  private country: string;

  constructor(private uploadService: UploadService) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  link(name){
    let invoice = {};
    let header = function(currentPage, pageCount) { return [{ text: currentPage.toString() + ' of ' + pageCount, alignment: 'center', fontSize: 8 }] };
    let content = [];
    let style = {};
    let defaultStyle = {};
    let footer = {};

    footer = {
			table: {
        alignment: 'center',
        widths: ['50%', '50%'],
				body: [
          this.productMessage('test message product'),
					[
            {
							border: [false, true, false, true],
              table: {
                widths: ['98%'],
                body: [
                  [
                    [
                      { text: 'For enquiries contact :', fontSize: 8 },
                      this.contact('+ 33 1 73 02 32 15', 'accounts-receivable@quanthouse.com'),
                      { text:'\n', fontSize: 10 },
                      { text: 'Reverse-charge', fontSize: 8 },
                      { text:'\n', fontSize: 16 },
                      {
                        widths: ['100%'],
                        table: { body: this.condition(['the amoung must be paid in full without deducting any bank charges', 'no discount for early payment', 'late payment fee equal to 1.5 times the French legal rate of interest, form the due date until the date of payment', 'surchage of EUR 40 for collection costs in case of late payment', 'to ensure proper credit, please quote invoice # with your remittance or send remittance advice to accounts-receivable@quanthouse.com']) },
                        layout: { defaultBorder: false }
                      }
                    ]                    
                  ]
                ]
              },
              layout: { defaultBorder: false }
						},
						{
							border: [false, true, false, true],
              table: {
                widths: ['98%'],
                body: [ [ [ this.tabSum(this.totalHt, this.totalVat, this.totalTTC, this.currency), {text:'\n', fontSize: 8}, this.wireTransfer() ] ] ]
              },
              layout: { defaultBorder: false }
						}
          ]
				]
			},
			layout: { defaultBorder: false }
    };

    // Header
    content.push(
      {
        columns: [ [ { image: this.logo(), width: 200, height: 60 }, this.qhAddress('86 boulevard Haussmann', '75009', 'PARIS', 'FRANCE', 'SASU au capital de 48 782 296 €', 'RCS Paris 44970324800053', 'VAT : FR00449703248') ], { text:'', width: 150 },  this.header() ],
      },
      // Billing Address
      '\n',
      this.billinAddress(),
      '\n',
      {
        table: {
          headerRows: 1,
          widths: [ 200, 30, 65, 65, 100, 50 ],
          margin: [0,0,0,0],
          body: [
            [
              { text: 'Description', style: 'itemsHeader' }, 
              { text: 'Units', style: [ 'itemsHeader', 'center'] }, 
              { text: 'From', style: [ 'itemsHeader', 'center'] }, 
              { text: 'To', style: [ 'itemsHeader', 'center'] }, 
              { text: 'Services total', style: [ 'itemsHeader', 'center'] }, 
              { text: 'VAT Rate', style: [ 'itemsHeader', 'center'] } 
            ],
          ]
        },
      },
      {
        table: {
          headerRows: 0,
          widths: [ 200, 30, 65, 65, 100, 50 ],
          margin: [0,0,0,0],
          body: this.getOrders()
          // body: [ this.getOrders() ]
        },
        layout: { defaultBorder: false }
      }
    );

    style = {
      // Document Header
      datacmd: { alignment: 'right' },
      documentHeaderLeft: { fontSize: 10, margin: [0,0,0,0], alignment:'left' },
      documentHeaderCenter: { fontSize: 10, margin: [0,0,0,0], alignment:'center' },
      documentHeaderRight: { fontSize: 10, margin: [0,0,0,0], alignment:'right' },
      // Document Footer
      documentFooterLeft: { fontSize: 10, margin: [0,0,0,0], alignment:'left' },
      documentFooterCenter: { fontSize: 10, margin: [0,0,0,0], alignment:'center' },
      documentFooterRight: { fontSize: 10, margin: [0,0,0,0], alignment:'right' },
        // Invoice Title
      invoiceTitle: { fontSize: 22, bold: true, alignment:'right', margin:[0,0,0,15] },
      // Invoice Details
      invoiceSubTitle: { fontSize: 10, alignment:'left' },
      invoiceSubValue: { fontSize: 10, alignment:'right' },
      // Billing Headers
      invoiceBillingTitle: { fontSize: 14, bold: true, alignment:'left', margin:[0,20,0,5], },
      // Billing Details
      invoiceBillingDetails: { alignment:'left' },
      invoiceBillingAddressTitle: { margin: [0,7,0,3], bold: true },
      invoiceBillingAddress: {  },
      // Items Header
      itemsHeader: { margin: [0,5,0,5], bold: true },
      // Item Title
      itemTitle: { bold: true, },
      itemSubTitle: { italics: true, fontSize: 11},
      itemNumber: { margin: [0,5,0,5], alignment: 'center', },
      itemTotal: { margin: [0,5,0,5], bold: true, alignment: 'center', },

      // Items Footer (Subtotal, Total, Tax, etc)
      itemsFooterSubTitle: { margin: [0,5,0,5], bold: true, alignment:'right', fontSize: 10 },
      itemsFooterSubValue: { margin: [0,5,0,5], bold: true, alignment:'center', fontSize: 10 },
      itemsFooterTotalTitle: { margin: [0,5,0,5], bold: true, alignment:'right', fontSize: 10 },
      itemsFooterTotalValue: { margin: [0,5,0,5], bold: true, alignment:'center', fontSize: 10 },
      signaturePlaceholder: { margin: [0,70,0,0],    },
      signatureName: { bold: true, alignment:'center', },
      signatureJobTitle: { italics: true, fontSize: 10, alignment:'center', },
      notesTitle: { fontSize: 10, bold: true, margin: [0,50,0,3] },
      notesText: { fontSize: 10 },
      center: { alignment:'center' },
    };

    invoice['pageMargins'] = [15, 15, 15, 230];
    invoice['header'] = header;
    invoice['content'] = content;
    invoice['footer'] = footer;
    invoice['style'] = style;
    invoice['defaultStyle'] = defaultStyle;
    
    // pdfMake.createPdf(invoice).open();
    // pdfMake.createPdf(invoice).download(name);
    // pdfMake.pipe(fs.createWriteStream('../../../../files/command/' + name + '.pdf'));
      // const files: FileList = name;
      // const tempFile = name;
      // if (tempFile) {
      //   const bodyRequest: FormData = new FormData();
      //   bodyRequest.append('doc', pdfMake.createPdf(invoice).download(name));
      //   this.uploadService.pdfOrderFrom(bodyRequest).subscribe((res) => {
      //   });
      // }
    pdfMake.createPdf(invoice).print();
  }
  
  qhAddress(address, cp, city, country, sasu, rcs, vat){
    return {
      text: address + '\n' + cp + ' ' + city + '\n' + country + '\n' + sasu + '\n' + rcs + '\n' +  vat,
      style: 'invoiceBillingAddress'
    };
  }

  setPdf(cmd, idUser, rib) {

    this.totalTTC = 0;
    this.totalVat = 0;
    this.totalHt = 0;

    this.orders = cmd.products;
    this.cmd = cmd;

    this.addressBeneficiary = '86 boulevard Haussmann';
    this.cpBeneficiary = '75009';
    this.cityBeneficiary = 'PARIS';
    this.countryBeneficiary = 'FRANCE';
    this.capitalBeneficiary = 'SASU au capital de 48 782 296 €';
    this.rcsBeneficiary = 'RCS Paris 44970324800053';
    this.vatBeneficiary = 'VAT : FR00449703248';

    this.numInvoice = cmd.invoice?cmd.invoice:'';
    this.numAccount = idUser?idUser:'';
    this.vat = this.idTax = cmd.vat?cmd.vat:'';
    this.invoiceDate = cmd.submissionDate?this.yyyymmdd(cmd.submissionDate):'';
    this.paymentDate = ''?'':'';
    this.numCmd = cmd.id?cmd.id:'';
    this.currency = cmd.currency?cmd.currency:'';

    this.companyName = cmd.companyName?cmd.companyName:'';
    this.address = cmd.addressBilling?cmd.addressBilling:'';
    this.cp = cmd.postalCodeBilling?cmd.postalCodeBilling:'';
    this.city = cmd.cityBilling?cmd.cityBilling:'';
    this.country = cmd.countryBilling?cmd.countryBilling:'';

    this.beneficiaire = 'QUANT HOUSE SASU';
    this.bankName = rib.rib.domiciliation?rib.rib.domiciliation:'';
    this.iban = rib.iban?rib.iban.ib1 + ' ' + rib.iban.ib2 + ' ' + rib.iban.ib3 + ' ' + rib.iban.ib4 + ' ' + rib.iban.ib5 + ' ' + rib.iban.ib6 + ' ' + rib.iban.ib7:'';
    this.bic = rib.bic?rib.bic:'';
    this.delay = rib.delay?rib.delay:'0';
    // this.addressRib = address;
    // this.cpRib = cp;
    // this.cityRib = city;
    // this.countryRib = country;
    // this.bankAddress = bankAddress;
    // this.bankCp = bankCp;
    // this.bankCity = bankCity;
    // this.bankCountry = bankCountry;
  }

  billinAddress() {
    return {
      text: this.companyName + '\n'+ this.address + '\n' + this.cp + ' ' + this.city + '\n' + this.country,
      style: 'invoiceBillingAddress'
    };
  }

  getOrders(){
    let listOrders = [];
    let border = [false, false, false, true];
    if (this.orders.length > 0) {
      this.orders.forEach(order => {
        listOrders.push([
          { border: border, text: order.idx + '\t' + order.description, style:'itemSubTitle' }, 
          { border: border, text: order.period, style:'itemNumber' }, 
          { border: border, text: order.begin_date_select, style:'itemNumber' }, 
          { border: border, text: order.end_date_select, style:'itemNumber' }, 
          { border: border, text: order.ht.toFixed(2), style:'itemNumber' },
          { border: border, text: (order.ht * this.cmd['vatValue']).toFixed(2), style:'itemTotal' } 
        ]);
      });
    }
    return listOrders;
  }

  tabSum(serviceTotal, vatTotal, invoiceTotal, currency){
    return {
      table: {
        widths: ['33%', '55%', '10%'],
        body: [
          [
            { text: 'Services total', style:'itemsFooterSubTitle' }, 
            { text: serviceTotal, style:'itemsFooterSubValue', alignment: 'right' },
            { text: currency, style:'itemsFooterSubValue' }
          ],
          [
            { text: 'VAT total', style:'itemsFooterSubTitle' },
            { text: vatTotal, style:'itemsFooterSubValue', alignment: 'right' },
            { text: currency, style:'itemsFooterSubValue' }
          ],
          [
            { text: 'Invoice total', style:'itemsFooterTotalTitle' }, 
            { text: invoiceTotal, style:'itemsFooterTotalValue', alignment: 'right' },
            { text: currency, style:'itemsFooterSubValue' }
          ],
        ]
      }
    };
  }

  condition(conditions){
    let tabCondition = [];
    tabCondition.push([{ text: 'General payment terms', fillColor: '#dddddd', fontSize: 8, }]);
    conditions.forEach(cond => {
      tabCondition.push([{ text: '- ' + cond, fontSize: 8, }]);
    });
    return tabCondition;
  }

  contact(tel, email){
    return [
      { text: tel, fontSize: 8 },
      { text: email, link: email, color: '#3a65ff', fontSize: 8 }
    ];
  }

  productMessage(message){
    return [ { colSpan: 2, fillColor: '#dddddd', text: message, fontSize: 8 }, '' ];
  }

  wireTransfer() {
    return {
      widths: ['100%'],
      table: {
        body: [
          [{ text: 'Wire transfer', fillColor: '#dddddd', fontSize: 8, }],
          [{ text: 'Beneficiary Name : ' + this.beneficiaire, fontSize: 8, }],
          [{ text: 'Beneficiary Address : ' + this.addressBeneficiary + ' - ' + this.cpBeneficiary + ' ' + this.cityBeneficiary + ' - ' + this.countryBeneficiary, fontSize: 8, }],
          [{ text: 'Receiving Bank Name : ' + this.bankName, fontSize: 8, }],
          [{ text: 'IBAN : ' + this.iban , fontSize: 8, }],
          // [{ text: 'Receiving Bank Address : ' + bankName + ', ' + bankAddress + ', ' + bankCp + ' ' + bankCity + ', ' + bankCountry , fontSize: 8, }],
          [{ text: 'BIC Code : ' + this.bic, fontSize: 8, }],
          [{ text: this.vat, fontSize: 8, }],
          [{ text: 'Payment '+ this.delay + ' days', fontSize: 8, }],
          [{ text: 'Currency : ' + this.currency.toLocaleUpperCase(), fontSize: 8, }],
        ]
      },
      layout: { defaultBorder: false }
    };
  }

  header(){
    let width = 100;
    return {
      table: {
        headerRows: 1,
        body: [
          [
            { text:'Invoice Nbr',  style:'invoiceSubTitle', width: width},
            { text: this.numInvoice, style:'invoiceSubValue', width: width }
          ],
          [
            { text:'Account n°', style:'invoiceSubTitle', width: width }, 
            { text: this.numAccount, style:'invoiceSubValue', width: width }
          ],
          [
            { text:'tax Id n°', style:'invoiceSubTitle', width: width }, 
            { text: this.idTax, style:'invoiceSubValue', width: width }
          ],
          [
            { text:'Invoice date', style:'invoiceSubTitle', width: width }, 
            { text: this.invoiceDate, style:'invoiceSubValue', width: width }
          ],
          [
            { text:'Payment due date', style:'invoiceSubTitle', width: width }, 
            { text: this.paymentDate, style:'invoiceSubValue', width: width }
          ],
          [
            { text:'Order form n°', style:'invoiceSubTitle', width: width }, 
            { text: this.numCmd, style:'invoiceSubValue', width: width }
          ],
          [
            { text:'Currency', style:'invoiceSubTitle', width: width }, 
            { text: this.currency, style:'invoiceSubValue', width: width }
          ]
        ]
      }
    };
  }

  logo(){
    return `data:image/jpeg;base64,/9j/4Qu1RXhpZgAATU0AKgAAAAgABwESAAMAAAABAAEAAAEaAAUAAAABAAAAYgEbAAUAAAABAAAAagEoAAMAAAABAAIAAAExAAIAAAAkAAAAcgEyAAIAAAAUAAAAlodpAAQAAAABAAAArAAAANgACvyAAAAnEAAK/IAAACcQQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkAMjAxNzowMjoyMSAxNzoxMDo1MgAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAEsoAMABAAAAAEAAABlAAAAAAAAAAYBAwADAAAAAQAGAAABGgAFAAAAAQAAASYBGwAFAAAAAQAAAS4BKAADAAAAAQACAAACAQAEAAAAAQAAATYCAgAEAAAAAQAACncAAAAAAAAASAAAAAEAAABIAAAAAf/Y/+0ADEFkb2JlX0NNAAH/7gAOQWRvYmUAZIAAAAAB/9sAhAAMCAgICQgMCQkMEQsKCxEVDwwMDxUYExMVExMYEQwMDAwMDBEMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMAQ0LCw0ODRAODhAUDg4OFBQODg4OFBEMDAwMDBERDAwMDAwMEQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAA2AKADASIAAhEBAxEB/90ABAAK/8QBPwAAAQUBAQEBAQEAAAAAAAAAAwABAgQFBgcICQoLAQABBQEBAQEBAQAAAAAAAAABAAIDBAUGBwgJCgsQAAEEAQMCBAIFBwYIBQMMMwEAAhEDBCESMQVBUWETInGBMgYUkaGxQiMkFVLBYjM0coLRQwclklPw4fFjczUWorKDJkSTVGRFwqN0NhfSVeJl8rOEw9N14/NGJ5SkhbSVxNTk9KW1xdXl9VZmdoaWprbG1ub2N0dXZ3eHl6e3x9fn9xEAAgIBAgQEAwQFBgcHBgU1AQACEQMhMRIEQVFhcSITBTKBkRShsUIjwVLR8DMkYuFygpJDUxVjczTxJQYWorKDByY1wtJEk1SjF2RFVTZ0ZeLys4TD03Xj80aUpIW0lcTU5PSltcXV5fVWZnaGlqa2xtbm9ic3R1dnd4eXp7fH/9oADAMBAAIRAxEAPwD1VJJJJSkli9T+tGFhWOopacq9hh7WEBjSPzLLj+f/ACK22LN/565LXFz8OvZ4eqQf841bVDLmcUTRl9g4mzDkeZnHijDQ7cRjC/pJ6xJZnS+v4PUnekyackCTRZAcQPpOrc2WWt/q/wDXFpqSMoyFxNhhyY545cM4mMuxUkkknLFJJJJKUkkkkpSSSSSlJJJJKUkkkkpSSSSSn//Q9VWP9Z+pWYXTwyhxZflO9NjwYLWxutsb/K2DYz/hLFsLl/rq127Bf+aPVbPmRU5v/RreouYkY4pEb7f4x4WzyUIz5jHGWosn/EjxhwcLp+VmF7MSsObS3c8lwYxo127nu/e2q903AysTreDXmVembfVc1ji10gVW/Sa0ub9JDxAD9Xesh0FpNMg8ctVjqWVbiv6LlU7TZVhAs3gub7mtqO7Vu72WKhGMYiMzdjhn4V7nBt/guxknknKeMVUuPEN+Li9j3OLiv97J+45uTQzFOI/FfY0W41GXU55Bsrc8Oj3saxj9np/uLuukZ/7Q6dTlEBr3gixo4D2k12R/J3t9q4G259raWviMelmNXAj9HVu9Pfr7rPf7nLrvqg1zekFx4fdYWfAHZ/1bHqXlJfrZCPykXXk1/iUP1EZS+eMqB8JXo4f1rzOr9Q+ufTfqpiZ1vTMS/Gdl5F+Mdtz4N0Vtt+lXt+zfm/6X9J6v6ND+p/1lzcKn6xYnXct+bR9XLtrcxzZtdWTayHtb7n7fs+/3+o/9L/ObE/UyB/jg6TJiemPj781YVJBp/wAZMa/pD/1WWr7jPoNX1o6RbmdNwmPeb+sUfasMbHQ6vYb5e7/Bu9Nv0VUt+vv1dq6n+zn2Wgi/7I7K9J32ZuRx9lfkxt9X/wAD/lrl+nf+Kb6h/wDpn/8AdV6yvrNmMz+m3W9Koow+h1dcZXta1zrsjLhxyMx7nO9OnHczZ6Vez1H/APBfzaSnv+s/XnoHRcy3AzH2uy6ahf6NVTnlzIL3bCPZ+jra+2ze7YytZv1q+v8AT0/6v4PVujOryHdRf+g9auxzDWzTJ3em6n07qn+3032f1GPVDP8A/wAoXXP/AKX7P+qqWF1Gf/Ga6TH/AHJH/n7JSU9P1/6w35HXPqjZ0rJtrwepX3i5gDq/VYw47R6tVrWv262fTYj9J6pnWf4xuvYF2S84OLj0Ppocf0bC6vHe97R+b9N6z/8AGThtz/rF9VMJ9tlDci7IYbqHbLWz9k99NkO2PWd0bptfSfrT9bOnV3XZLMfpgAuyXb7Xbqq7v0tgazdt9TYz2/zaSnrunfX/AOrfUeo1YGPbYHZLnMxL7KnMpvcz+cZj3PHuc3+Xs/6hWLfrh0SpvVXPssjoZY3Oit3tNhLa/T/0n0fzV55gD/If+L7w/aNn/tyjZ/8AN/4xv6+L/wBVakp7zqP1w6P0/Ewsmz1rj1Kv1sSiip1lz6wxt9lvpAextVL/AFLfUT5f1w6BjdIxuseubsXOcGYYpY59lrzI9GqkDf6u5jmPa/6Fn6Nc31LCvd0X6vdX6NewfWHpGBXfRhEtc7Jx3VVty6fQ/nn+3+b9L/hK/wCesqtqz+u5uL1Gv6k5n1fpowq78p7sag1xTXburFtb6afQ3NZlepv9L0/U/nElPf8AROudP65hnLwHOLGPdTbXY0ssrsbHqU21v+jYzctBYH1U6D1DpB6ld1C6m7J6nluynfZ2uaxu4CWtbaXP+nuW+kp//9H1VUes9MHU8B+OCG2gh9Lzw17fo7v5Dv5t/wDwb1eSQlESBidjouhOUJCcTUomw+e0Zmb0t+TiWUVk2t25GJks3tMTtftBb6jP5f8ANXKx1zKZlDp7xay2xuKBfsI9th2FzHtZ/Nu/4NdlmdPws5gZl0tuDfolw1bP7jx72f2FQH1U6GHT6LyP3TbZH/nxU5crlAMIyBgduLSteJ04fEMBlHJOEo5Bd8AjKMrjwfpSi8hg4WT1DJGNiiX6b3xLawf8Jb/3yv8Awq9Aw8WrDxasWkRXS0NbPJj8538p35yfGxcbFqFONU2mscMYA0T46IqmwYBiBN3I7lq85zhzkADhhHYdSf3pOF9Zvqf036xCq619mJ1DFB+yZ+O7ZawnVsx/OVts9+3/ALasq9SxZ31Z+on7I6Z1Ho2dbTm4PUB7rGVuqucXB7LfWc6y76LPS9DY/wBnvXXJKdqPNdK+oPRul5uBn1XZd+V01j6qLMi71Jre11baXM2trZVjsss9CqhtLP0n+EQsj/Fv9X735RdZlsqyshuYMZlxbTVeDNl2Nj7fTbZc39G99nq7Kv0eP6K6pJJTkW/Vfpt3V8vq73W/ac3EOBaA4Bgqdt3Gtu3c232fS3qrb9R+i2/Viv6svNxwaDuqs3j1mu3vu9QWbPT3brX/AOC2LoUklOHZ9UenXP6Pbffk3W9CLnY1tlm57y7ZudlPLP0v8yz6Ppo9H1b6dR1zO64N78rqNbKchjyDVtY1lY217fzmVN3bnLVSSU8x0z/F70HpvUKc2p+TczDc9+Bh5Fpsx8Z1h3Pfi0uG5rv+Nst/0v8APbLEuo/4vehdQzc/Lusyqx1NgblY9VxZS57f5rJdS1v6S+p3vr9b1aPU/SeiunSSU891P6kdI6hjYFXq5OJf0uoUYubi2+nkCoM9B1L7tr97LGfS9n7/APpbfUfM+o/QMrouL0YV2Y9GA4Pw76X7b6ng73W13Hf77HOc6ze3/hP5z010CSSnP6J0avo+I7GZk5OabLDa+/MtN1pcQ1n85Dfbtrb7VoJJJKf/0vVUl8qpJKfqpJfKqSSn6qSXyqkkp+qkl8qpJKfqpJfKqSSn6qSXyqkkp+qkl8qpJKfqpJfKqSSn6qSXyqkkp+qkl8qpJKf/2f/tFKRQaG90b3Nob3AgMy4wADhCSU0EBAAAAAAAHhwBWgADGyVHHAIAAAIAABwCBQAKSW1wcmVzc2lvbjhCSU0EJQAAAAAAEJT3XCmjaa6SVQoxzAtQv7c4QklNBDoAAAAAAccAAAAQAAAAAQAAAAAAC3ByaW50T3V0cHV0AAAABwAAAABDbHJTZW51bQAAAABDbHJTAAAAAFJHQkMAAAAATm0gIFRFWFQAAAA4AEUAcABzAG8AbgAgAFMAdAB5AGwAdQBzACAAUAByAG8AIAAzADgAOAAwAF8AMwA4ADgANQBfADMAOAA5ADAAIABQAHIAZQBtAGkAdQBtAEcAbABvAHMAcwB5AFAAaABvAHQAbwBQAGEAcABlAHIAAAAAAABJbnRlZW51bQAAAABJbnRlAAAAAENscm0AAAAATXBCbGJvb2wBAAAAD3ByaW50U2l4dGVlbkJpdGJvb2wAAAAAC3ByaW50ZXJOYW1lVEVYVAAAAB8ARQBwAHMAbwBuAFMAdAB5AGwAdQBzAFAAcgBvADMAOAA4ADAALQAxAEUAOAA3AEIAMwAgACgASQBQACkAAAAAAA9wcmludFByb29mU2V0dXBPYmpjAAAAEQBGAG8AcgBtAGEAdAAgAGQAJwDpAHAAcgBlAHUAdgBlAAAAAAAKcHJvb2ZTZXR1cAAAAAEAAAAAQmx0bmVudW0AAAAMYnVpbHRpblByb29mAAAACXByb29mQ01ZSwA4QklNBDsAAAAAAi0AAAAQAAAAAQAAAAAAEnByaW50T3V0cHV0T3B0aW9ucwAAABcAAAAAQ3B0bmJvb2wAAAAAAENsYnJib29sAAAAAABSZ3NNYm9vbAAAAAAAQ3JuQ2Jvb2wAAAAAAENudENib29sAAAAAABMYmxzYm9vbAAAAAAATmd0dmJvb2wAAAAAAEVtbERib29sAAAAAABJbnRyYm9vbAAAAAAAQmNrZ09iamMAAAABAAAAAAAAUkdCQwAAAAMAAAAAUmQgIGRvdWJAb+AAAAAAAAAAAABHcm4gZG91YkBv4AAAAAAAAAAAAEJsICBkb3ViQG/gAAAAAAAAAAAAQnJkVFVudEYjUmx0AAAAAAAAAAAAAAAAQmxkIFVudEYjUmx0AAAAAAAAAAAAAAAAUnNsdFVudEYjUHhsQFIAAAAAAAAAAAAKdmVjdG9yRGF0YWJvb2wBAAAAAFBnUHNlbnVtAAAAAFBnUHMAAAAAUGdQQwAAAABMZWZ0VW50RiNSbHQAAAAAAAAAAAAAAABUb3AgVW50RiNSbHQAAAAAAAAAAAAAAABTY2wgVW50RiNQcmNAWQAAAAAAAAAAABBjcm9wV2hlblByaW50aW5nYm9vbAAAAAAOY3JvcFJlY3RCb3R0b21sb25nAAAAAAAAAAxjcm9wUmVjdExlZnRsb25nAAAAAAAAAA1jcm9wUmVjdFJpZ2h0bG9uZwAAAAAAAAALY3JvcFJlY3RUb3Bsb25nAAAAAAA4QklNA+0AAAAAABAASAAAAAEAAgBIAAAAAQACOEJJTQQmAAAAAAAOAAAAAAAAAAAAAD+AAAA4QklNBA0AAAAAAAQAAAAeOEJJTQQZAAAAAAAEAAAAHjhCSU0D8wAAAAAACQAAAAAAAAAAAQA4QklNJxAAAAAAAAoAAQAAAAAAAAACOEJJTQP1AAAAAABIAC9mZgABAGxmZgAGAAAAAAABAC9mZgABAKGZmgAGAAAAAAABADIAAAABAFoAAAAGAAAAAAABADUAAAABAC0AAAAGAAAAAAABOEJJTQP4AAAAAABwAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAADhCSU0ECAAAAAAAEAAAAAEAAAJAAAACQAAAAAA4QklNBB4A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JKfqpJfKqSSn6qSXyqkkp+qkl8qpJKfqpJfKqSSn6qSXyqkkp+qkl8qpJKfqpJfKqSSn6qSXyqkkp//ZADhCSU0EIQAAAAAAXQAAAAEBAAAADwBBAGQAbwBiAGUAIABQAGgAbwB0AG8AcwBoAG8AcAAAABcAQQBkAG8AYgBlACAAUABoAG8AdABvAHMAaABvAHAAIABDAEMAIAAyADAAMQA3AAAAAQA4QklNBAYAAAAAAAcACAAAAAEBAP/hN0BodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6aWxsdXN0cmF0b3I9Imh0dHA6Ly9ucy5hZG9iZS5jb20vaWxsdXN0cmF0b3IvMS4wLyIgeG1sbnM6eG1wVFBnPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvdC9wZy8iIHhtbG5zOnN0RGltPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvRGltZW5zaW9ucyMiIHhtbG5zOnhtcEc9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9nLyIgeG1sbnM6cGRmPSJodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxNy0wMi0yMVQxNzoxMDo1MiswMTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTctMDItMjFUMTc6MTA6NTIrMDE6MDAiIHhtcDpDcmVhdGVEYXRlPSIyMDE3LTAyLTE2VDE2OjQ3OjU1KzAxOjAwIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIElsbHVzdHJhdG9yIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZDU4Y2VkZTQtNWI3Mi00YjZiLWFmYTEtZmVkYjIzYTEwZWJmIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YTY2N2NkNzgtMzhkNC0xMTdhLWFhOGMtZDA3ZDkwMjI4N2Q5IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InV1aWQ6NUQyMDg5MjQ5M0JGREIxMTkxNEE4NTkwRDMxNTA4QzgiIHhtcE1NOlJlbmRpdGlvbkNsYXNzPSJwcm9vZjpwZGYiIGlsbHVzdHJhdG9yOlN0YXJ0dXBQcm9maWxlPSJQcmludCIgeG1wVFBnOkhhc1Zpc2libGVPdmVycHJpbnQ9IlRydWUiIHhtcFRQZzpIYXNWaXNpYmxlVHJhbnNwYXJlbmN5PSJGYWxzZSIgeG1wVFBnOk5QYWdlcz0iMSIgcGRmOlByb2R1Y2VyPSJBZG9iZSBQREYgbGlicmFyeSAxMC4wMSIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIj4gPGRjOnRpdGxlPiA8cmRmOkFsdD4gPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5JbXByZXNzaW9uPC9yZGY6bGk+IDwvcmRmOkFsdD4gPC9kYzp0aXRsZT4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDIxZWZmMWMtNTFhZi00NDBhLWEyOTYtNTk0YjFmY2VhMmM2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOmE1NzI2NThjLWM2YTItNDgzZC1iYjk2LWViNjM4Y2E3OTM1YSIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjVEMjA4OTI0OTNCRkRCMTE5MTRBODU5MEQzMTUwOEM4IiBzdFJlZjpyZW5kaXRpb25DbGFzcz0icHJvb2Y6cGRmIi8+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjkxN2Y1MDdhLWQ2NjMtNDI5OS1iY2Y3LWJjNzAxOGQ0ZjgxZiIgc3RFdnQ6d2hlbj0iMjAxNy0wMi0xNlQxNjo0Nzo1NiswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgSWxsdXN0cmF0b3IgQ0MgMjAxNyAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3Bvc3RzY3JpcHQgdG8gaW1hZ2UvZXBzZiIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6OGU5OTBjZWQtZTgzNy00NjA0LThmZGItNDFjZjJhNmNkNjBjIiBzdEV2dDp3aGVuPSIyMDE3LTAyLTIxVDE3OjA5OjQxKzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3Bvc3RzY3JpcHQgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvZXBzZiB0byBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphNTcyNjU4Yy1jNmEyLTQ4M2QtYmI5Ni1lYjYzOGNhNzkzNWEiIHN0RXZ0OndoZW49IjIwMTctMDItMjFUMTc6MDk6NDErMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo0MjFlZmYxYy01MWFmLTQ0MGEtYTI5Ni01OTRiMWZjZWEyYzYiIHN0RXZ0OndoZW49IjIwMTctMDItMjFUMTc6MTArMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9qcGVnIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL2pwZWciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjI4ZTg0MGNmLTIxMDgtNDc3ZC1iOThlLTE4YjVkNjZhNzYxMyIgc3RFdnQ6d2hlbj0iMjAxNy0wMi0yMVQxNzoxMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmQ1OGNlZGU0LTViNzItNGI2Yi1hZmExLWZlZGIyM2ExMGViZiIgc3RFdnQ6d2hlbj0iMjAxNy0wMi0yMVQxNzoxMDo1MiswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBUUGc6TWF4UGFnZVNpemUgc3REaW06dz0iMjkuNzAwMDA4IiBzdERpbTpoPSIyMS4wMDAxNTYiIHN0RGltOnVuaXQ9IkNlbnRpbWV0ZXJzIi8+IDx4bXBUUGc6UGxhdGVOYW1lcz4gPHJkZjpTZXE+IDxyZGY6bGk+Q3lhbjwvcmRmOmxpPiA8cmRmOmxpPk1hZ2VudGE8L3JkZjpsaT4gPHJkZjpsaT5ZZWxsb3c8L3JkZjpsaT4gPHJkZjpsaT5CbGFjazwvcmRmOmxpPiA8cmRmOmxpPlBBTlRPTkUgMTY0NSBDPC9yZGY6bGk+IDwvcmRmOlNlcT4gPC94bXBUUGc6UGxhdGVOYW1lcz4gPHhtcFRQZzpTd2F0Y2hHcm91cHM+IDxyZGY6U2VxPiA8cmRmOmxpPiA8cmRmOkRlc2NyaXB0aW9uIHhtcEc6Z3JvdXBOYW1lPSJHcm91cGUgZGUgbnVhbmNlcyBwYXIgZMOpZmF1dCIgeG1wRzpncm91cFR5cGU9IjAiPiA8eG1wRzpDb2xvcmFudHM+IDxyZGY6U2VxPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQmxhbmMiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyNTUiIHhtcEc6Z3JlZW49IjI1NSIgeG1wRzpibHVlPSIyNTUiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9Ik5vaXIiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyNiIgeG1wRzpncmVlbj0iMjMiIHhtcEc6Ymx1ZT0iMjciLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IlJvdWdlIENNSk4iIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyMjYiIHhtcEc6Z3JlZW49IjAiIHhtcEc6Ymx1ZT0iMjYiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkphdW5lIENNSk4iIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyNTUiIHhtcEc6Z3JlZW49IjIzNyIgeG1wRzpibHVlPSIwIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJWZXJ0IENNSk4iIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIwIiB4bXBHOmdyZWVuPSIxNDQiIHhtcEc6Ymx1ZT0iNTQiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkN5YW4gQ01KTiIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjAiIHhtcEc6Z3JlZW49IjE1OCIgeG1wRzpibHVlPSIyMjQiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkJsZXUgQ01KTiIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjIzIiB4bXBHOmdyZWVuPSI0MSIgeG1wRzpibHVlPSIxMzEiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9Ik1hZ2VudGEgQ01KTiIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjIyNiIgeG1wRzpncmVlbj0iMCIgeG1wRzpibHVlPSIxMjIiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MTUgTT0xMDAgSj05MCBOPTEwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTkwIiB4bXBHOmdyZWVuPSIxMCIgeG1wRzpibHVlPSIzOCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0wIE09OTAgSj04NSBOPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyMjkiIHhtcEc6Z3JlZW49IjUzIiB4bXBHOmJsdWU9IjQ1Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT04MCBKPTk1IE49MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjIzMSIgeG1wRzpncmVlbj0iODEiIHhtcEc6Ymx1ZT0iMzAiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTUwIEo9MTAwIE49MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjI0MiIgeG1wRzpncmVlbj0iMTQ4IiB4bXBHOmJsdWU9IjAiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTM1IEo9ODUgTj0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjQ4IiB4bXBHOmdyZWVuPSIxNzkiIHhtcEc6Ymx1ZT0iNTIiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9NSBNPTAgSj05MCBOPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyNTIiIHhtcEc6Z3JlZW49IjIzNCIgeG1wRzpibHVlPSIxMyIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0yMCBNPTAgSj0xMDAgTj0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjIzIiB4bXBHOmdyZWVuPSIyMTkiIHhtcEc6Ymx1ZT0iMCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz01MCBNPTAgSj0xMDAgTj0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTUxIiB4bXBHOmdyZWVuPSIxOTEiIHhtcEc6Ymx1ZT0iMTMiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9NzUgTT0wIEo9MTAwIE49MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjY1IiB4bXBHOmdyZWVuPSIxNjYiIHhtcEc6Ymx1ZT0iNDIiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9ODUgTT0xMCBKPTEwMCBOPTEwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMCIgeG1wRzpncmVlbj0iMTM4IiB4bXBHOmJsdWU9IjQ2Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTkwIE09MzAgSj05NSBOPTMwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMCIgeG1wRzpncmVlbj0iOTkiIHhtcEc6Ymx1ZT0iNDYiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9NzUgTT0wIEo9NzUgTj0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iNTYiIHhtcEc6Z3JlZW49IjE2OSIgeG1wRzpibHVlPSI5OCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz04MCBNPTEwIEo9NDUgTj0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMCIgeG1wRzpncmVlbj0iMTYwIiB4bXBHOmJsdWU9IjE1MCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz03MCBNPTE1IEo9MCBOPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSI1NyIgeG1wRzpncmVlbj0iMTY5IiB4bXBHOmJsdWU9IjIyMCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz04NSBNPTUwIEo9MCBOPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxMSIgeG1wRzpncmVlbj0iMTE0IiB4bXBHOmJsdWU9IjE4MSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0xMDAgTT05NSBKPTUgTj0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTMiIHhtcEc6Z3JlZW49IjQ5IiB4bXBHOmJsdWU9IjEzMSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0xMDAgTT0xMDAgSj0yNSBOPTI1IiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTkiIHhtcEc6Z3JlZW49IjM1IiB4bXBHOmJsdWU9IjkxIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTc1IE09MTAwIEo9MCBOPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSI5OCIgeG1wRzpncmVlbj0iMzMiIHhtcEc6Ymx1ZT0iMTI5Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTUwIE09MTAwIEo9MCBOPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxNDciIHhtcEc6Z3JlZW49IjE3IiB4bXBHOmJsdWU9IjEyNiIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0zNSBNPTEwMCBKPTM1IE49MTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxNjEiIHhtcEc6Z3JlZW49IjEzIiB4bXBHOmJsdWU9Ijg5Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTEwIE09MTAwIEo9NTAgTj0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjEyIiB4bXBHOmdyZWVuPSIwIiB4bXBHOmJsdWU9IjgwIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT05NSBKPTIwIE49MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjIyOCIgeG1wRzpncmVlbj0iMTgiIHhtcEc6Ymx1ZT0iMTEyIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTI1IE09MjUgSj00MCBOPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyMDMiIHhtcEc6Z3JlZW49IjE4NyIgeG1wRzpibHVlPSIxNTciLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9NDAgTT00NSBKPTUwIE49NSIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjE2NCIgeG1wRzpncmVlbj0iMTM4IiB4bXBHOmJsdWU9IjExOSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz01MCBNPTUwIEo9NjAgTj0yNSIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjEyMCIgeG1wRzpncmVlbj0iMTA0IiB4bXBHOmJsdWU9Ijg1Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTU1IE09NjAgSj02NSBOPTQwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iOTUiIHhtcEc6Z3JlZW49Ijc2IiB4bXBHOmJsdWU9IjYzIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTI1IE09NDAgSj02NSBOPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyMDIiIHhtcEc6Z3JlZW49IjE1OCIgeG1wRzpibHVlPSIxMDAiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MzAgTT01MCBKPTc1IE49MTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxNzYiIHhtcEc6Z3JlZW49IjEyNyIgeG1wRzpibHVlPSI3MiIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0zNSBNPTYwIEo9ODAgTj0yNSIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjE0NSIgeG1wRzpncmVlbj0iOTQiIHhtcEc6Ymx1ZT0iNTQiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9NDAgTT02NSBKPTkwIE49MzUiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxMjQiIHhtcEc6Z3JlZW49Ijc3IiB4bXBHOmJsdWU9IjM3Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTQwIE09NzAgSj0xMDAgTj01MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjEwMyIgeG1wRzpncmVlbj0iNTkiIHhtcEc6Ymx1ZT0iMjEiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9NTAgTT03MCBKPTgwIE49NzAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSI2NSIgeG1wRzpncmVlbj0iNDAiIHhtcEc6Ymx1ZT0iMjciLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IlBBTlRPTkUgMTY0NSBDIiB4bXBHOnR5cGU9IlNQT1QiIHhtcEc6dGludD0iMTAwLjAwMDAwMCIgeG1wRzptb2RlPSJDTVlLIiB4bXBHOmN5YW49IjAuMDAwMDAwIiB4bXBHOm1hZ2VudGE9IjcwLjMyNzMwNiIgeG1wRzp5ZWxsb3c9Ijc1Ljg5Njg0NyIgeG1wRzpibGFjaz0iMC4wMDAwMDAiLz4gPC9yZGY6U2VxPiA8L3htcEc6Q29sb3JhbnRzPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6bGk+IDxyZGY6bGk+IDxyZGY6RGVzY3JpcHRpb24geG1wRzpncm91cE5hbWU9IkdyaXMiIHhtcEc6Z3JvdXBUeXBlPSIxIj4gPHhtcEc6Q29sb3JhbnRzPiA8cmRmOlNlcT4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTAgSj0wIE49MTAwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjYiIHhtcEc6Z3JlZW49IjIzIiB4bXBHOmJsdWU9IjI3Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0wIEo9MCBOPTkwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iNjIiIHhtcEc6Z3JlZW49IjYxIiB4bXBHOmJsdWU9IjY0Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0wIEo9MCBOPTgwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iODgiIHhtcEc6Z3JlZW49Ijg4IiB4bXBHOmJsdWU9IjkwIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0wIEo9MCBOPTcwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTEyIiB4bXBHOmdyZWVuPSIxMTMiIHhtcEc6Ymx1ZT0iMTE1Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0wIEo9MCBOPTYwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTM1IiB4bXBHOmdyZWVuPSIxMzYiIHhtcEc6Ymx1ZT0iMTM4Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0wIEo9MCBOPTUwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTU2IiB4bXBHOmdyZWVuPSIxNTgiIHhtcEc6Ymx1ZT0iMTU5Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0wIEo9MCBOPTQwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTc3IiB4bXBHOmdyZWVuPSIxNzkiIHhtcEc6Ymx1ZT0iMTgwIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0wIEo9MCBOPTMwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTk4IiB4bXBHOmdyZWVuPSIxOTkiIHhtcEc6Ymx1ZT0iMjAwIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0wIEo9MCBOPTIwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjE3IiB4bXBHOmdyZWVuPSIyMTgiIHhtcEc6Ymx1ZT0iMjE5Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0wIEo9MCBOPTEwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjM2IiB4bXBHOmdyZWVuPSIyMzciIHhtcEc6Ymx1ZT0iMjM3Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0wIEo9MCBOPTUiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyNDYiIHhtcEc6Z3JlZW49IjI0NiIgeG1wRzpibHVlPSIyNDYiLz4gPC9yZGY6U2VxPiA8L3htcEc6Q29sb3JhbnRzPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6bGk+IDxyZGY6bGk+IDxyZGY6RGVzY3JpcHRpb24geG1wRzpncm91cE5hbWU9IkNvdWxldXJzIHZpdmVzIiB4bXBHOmdyb3VwVHlwZT0iMSI+IDx4bXBHOkNvbG9yYW50cz4gPHJkZjpTZXE+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0xMDAgSj0xMDAgTj0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjI2IiB4bXBHOmdyZWVuPSIwIiB4bXBHOmJsdWU9IjI2Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT03NSBKPTEwMCBOPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyMzMiIHhtcEc6Z3JlZW49IjkzIiB4bXBHOmJsdWU9IjE1Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0xMCBKPTk1IE49MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjI1NSIgeG1wRzpncmVlbj0iMjIxIiB4bXBHOmJsdWU9IjAiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9ODUgTT0xMCBKPTEwMCBOPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIwIiB4bXBHOmdyZWVuPSIxNDgiIHhtcEc6Ymx1ZT0iNDgiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MTAwIE09OTAgSj0wIE49MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjAiIHhtcEc6Z3JlZW49IjU1IiB4bXBHOmJsdWU9IjEzOSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz02MCBNPTkwIEo9MCBOPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxMjgiIHhtcEc6Z3JlZW49IjU0IiB4bXBHOmJsdWU9IjEzNyIvPiA8L3JkZjpTZXE+IDwveG1wRzpDb2xvcmFudHM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpsaT4gPC9yZGY6U2VxPiA8L3htcFRQZzpTd2F0Y2hHcm91cHM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz7/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCIFhZWiAHzgACAAkABgAxAABhY3NwTVNGVAAAAABJ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dVY3hIWjs8PT4/MpGpSktMTU5PSVpbXF1eX1KEdXZjh2hpamtsbW5vZnd4eXp7fH1+f3SFhoeIiYqLjI2Oj4OUlZaXmJmam5ydnp+So6SlpqeoqaqrrK2ur6/9oADAMBAAIRAxEAPwDf49+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X/9Df49+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X/9Hf49+691737r3Xvfuvde9+691737r3RUuyfnF8UOp8hUYbePd2zUz1Kr+fb+3qiq3jm4ZIyytT1GN2lS5qoo6jUpGicRkH629x/vfup7fcvTPbblzTbC7XjHGTM4+RWEOQfk1Opm5U+717z86W0V/sXt9fnbnpSaZVtYiD+JXuWiVl+aavl0B9P/NZ+Gs9SlO+8N60sbOENZVdX77SkjBNjJI6YWSVY1+pOj6ewqn3gPbRnCHcrpRXibWen2/Acfl1IUv3NPfeOJpV2Pb3YCuldwsyx+QBlAr+fRoOqvlN8d+7pjR9W9wbI3blAdJwVNlkx+5OFLsf7tZhMdn9KqpLH7ay/kj2POX+fuTOaW8LYeZLW4uP99h9Mv8AzifTJ/xnqIecvZ33Q9voxPzhyNuFlZ/7+aMvB6f28ReH7Brz5dD77F3Ua9e9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X/0t/j37r3Xvfuvde9+690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33lOFQkTGTRfWsYwEinYMs0SDCQXAbQO2KWJRTqnvevwV+Z3UWZgq4uo915yfG1hqsPvHpnMx7nNNNSswgymMlxFRid7YWsAu0bfYwTIDw319437p7Ue5nLtyki8u3ErxtVJrNxLQjgylCk6N6fpqw8j1nJsH3ivYXnawkhbnayt45U0y2u6RG31BuMcglWS0lXyYeM6mmR0FeV6s+U+9clS0+4esvkpvbM0EUtHQJunafaG5a7HwTTCaoo6Cq3FS1goaaeoUPJHFIkbyDUwJF/YfuNg5+3SeNLzYt7urlAVXxYrqRlBNSFMgOkE5IBAJyc9DOz5x9ndgtZZds5t5T2+xkIZzb3O3wI5AorOsDLrYLhWZSwBoMY6Hrqz+Wz8uuz6mmau2HRdSYOV2FTnu0spS0tXTotmLUuz9v1GW3DXSMpsqTnHozcGVeSBdsHsl7i766GXaV260PGS6YAj7IYy8jH0DeGPVh1G3OP3rfZLlGKUW/Mkm97io7YdvjZlY+jXMwjhQepTxiBwQ46vH+KHwF6g+LTruimkquw+2p6OairOy9zUlLDU42lql0VmN2TgoDNQ7OxdVF6JjE89dVLdaiqmWyrlR7fe0fLnIRF+ha85hKlWuZQAVB4rBGKrCh4GhaRhh5GGBzz95/vJ88e8KnaJVTa+SlkDrYW7MVkZcrJdzGj3UinK6gkMZzFChqSef3K3WO/Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/0d/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/0t/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/09/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/2Q==`;
  }

  idcommande = function(prefix, id, nbcar) {
    let idf = prefix;
    let nbid = nbcar - id.toString().length;

    for (let i = 0; i < nbid; i++){
      idf+= "0";
    }
    let idnew =  id + 1;
    idf += idnew;
    return idf;
  }

  yyyymmdd = function(dt) {
    const d = new Date(dt);
    const mm = d.getMonth() + 1;
    const dd = d.getDate();
  
    return [d.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('-');
  };
}