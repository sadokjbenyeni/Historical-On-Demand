const mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
var pdfMake = require('pdfmake/src/printer');
const User = mongoose.model('User');
const Currency = mongoose.model('Currency');
const Country = mongoose.model('Countrie');
const DateService = require('../service/dateService');
const LogoService = require('./logoService');
const { table, count } = require('console');
const { text } = require('body-parser');
const { tree } = require('gulp');
const { currency } = require('../config/config');
const invoiceDirectory = global.environment.InvoiceDirectory;

module.exports = function (order) {
  this.order = order;

  this.createInvoicePdf = async function (logger, invoiceId, invoiceType) {
    logger.info({ message: "creating invoice in pdf...", className: "Order PDF Service" });
    var user = await User.findOne({ _id: this.order.userId }).exec();
    var country = await Country.findOne({ id: this.order.countryBilling }).exec();
    var currency = await Currency.findOne({ id: this.order.currency }).exec();
    this.generatePdfFile(currency, user, country, invoiceId, invoiceType);
    return true;
  }

  this.generatePdfFile = function (currency, user, country, invoiceId, invoiceType) {
    let fonts = {
      Roboto: {
        normal: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
        bold: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
        italics: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
        bolditalics: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64')
      }
    };

    printer = new pdfMake(fonts);
    let invoice = {};
    let defaultStyle = {
      font: 'Roboto'
    };

    var invoiceInformation = { id: invoiceId, type: invoiceType, issueDate: toCalendarFormat(new Date()), dueDate: toCalendarFormat(this.order.submissionDate) };
    var client = { company: this.order.companyName, address: this.order.addressBilling, postalCode: this.order.postalCodeBilling, city: this.order.cityBilling, country: this.order.countryBilling };
    var company = { name: 'QUANTHOUSE', address: '86 boulevard Haussmann', postalCode: '75008', city: 'Paris', country: 'France' };
    var payment = { accountNumber: user.id, taxId: this.order.vat, orderId: this.order.orderId, currency: currency.name };

    let content = [];
    content.push(
      headerWithLogo(invoiceInformation, client, company, payment),
      orderListHeader(),
      drawLine(0, 555, 0, 0, 3, 'line', '#EA663B'),
      getOrders(this.order.products, currency),
      marginBottom(10),
      amountTable(this.order.totalHTDiscountFree, this.order.totalVat, this.order.vatValue, this.order.total, this.order.discount, currency, this.order.totalHT),
      drawLine(342, 560, -3, -3, 1, 'line', '#EA663B'),
      generalPaymentTerms(),
      drawLine(340, 560, 0, 0, 0.01, 'line'),
    );

    let isVatValid = this.order.vatValide;
    let footer = function (currentPage, pageCount) {
      return [
        bottom(currency, country, isVatValid),
        { text: currentPage + ' of ' + pageCount, alignment: 'center', fontSize: 8 }]
    };

    invoice['pageMargins'] = [15, 15, 15, 105];
    invoice['defaultStyle'] = defaultStyle;
    invoice['content'] = content;
    invoice['footer'] = footer;

    let pdfDoc = printer.createPdfKitDocument(invoice);

    var directory = invoiceDirectory;
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    pdfDoc.pipe(fs.createWriteStream(path.join(directory, invoiceId + '.pdf')));

    pdfDoc.end();
  };
}

orderListHeader = function () {
  let border = [false, false, false, true];
  return {
    table: {
      headerRows: 1,
      widths: [250, 40, 70, 70, 80],
      margin: [0, 5, 0, 5],
      body: [
        [
          { border: border, text: 'DESCRIPTION', margin: [0, 5, 0, 5], bold: true, alignment: 'center', color: '#6C6C6C' },
          { border: border, text: 'UNITS', margin: [0, 5, 0, 5], bold: true, alignment: 'center', color: '#6C6C6C' },
          { border: border, text: 'FROM', margin: [0, 5, 0, 5], bold: true, alignment: 'center', color: '#6C6C6C' },
          { border: border, text: 'TO', margin: [0, 5, 0, 5], bold: true, alignment: 'center', color: '#6C6C6C' },
          { border: border, text: 'TOTAL', margin: [0, 5, 0, 5], bold: true, alignment: 'center', color: '#6C6C6C' }
        ],
      ]
    },
    layout: { defaultBorder: false }
  }
}

function getOrders(orders, currency) {
  let listOrders = [];
  let border = [false, false, false, true];
  orders.forEach(
    eid => {
      eid.allproducts = eid.subscription.concat(eid.onetime)
    })
  let colorCounter = 1;
  if (orders.length > 0) {
    orders.forEach(eid => {
      eid.allproducts.forEach(product => {
        addProduct(listOrders, product, eid.exchangefee, border, colorCounter, currency);
        colorCounter++;
      });
    })
  }
  return {
    table: {
      headerRows: 0,
      widths: [250, 40, 70, 70, 80],
      margin: [0, 5, 0, 5],
      body: listOrders
    },
    layout: { defaultBorder: false }
  }
};

function addProduct(listOrders, product, exchangefee, border, colorCounter, currency) {
  var typeOrder = product.onetime === 1 ? "One-Off" : "Subscription";
  var dateDebut = product.onetime === 1 ? toCalendarFormat(product.begin_date) : toCalendarFormat(product.begin_date_ref);
  var dateFin = product.onetime === 1 ? toCalendarFormat(product.end_date) : toCalendarFormat(product.end_date_ref);
  var dataset = product.dataset === "L1TRADEONLY" ? "L1 - Trades" : product.dataset;
  let backgroundColor = colorCounter % 2 == 0 ? "#F6F6F6" : "#ffffff";
  let currencySymbol = currency.symbol;
  listOrders.push([
    { border: border, text: product.idx + '\t' + typeOrder + "  " + dataset, margin: [0, 5, 0, 5], fontSize: 10, fillColor: backgroundColor, color: '#6C6C6C' },
    { border: border, text: "1", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, fillColor: backgroundColor, color: '#6C6C6C' },
    { border: border, text: dateDebut, margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, fillColor: backgroundColor, color: '#6C6C6C' },
    { border: border, text: dateFin, margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, fillColor: backgroundColor, color: '#6C6C6C' },
    { border: border, text: `${currencySymbol} ${product.ht.toFixed(2)}`, margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, fillColor: backgroundColor, color: '#6C6C6C' },
  ]);
  if (product.backfill_fee > 0 || product.ongoing_fee > 0) {
    listOrders.push([
      { border: border, text: "\tExchanges fees", margin: [0, 5, 0, 5], alignment: 'right', fontSize: 10, color: '#6C6C6C', fillColor: '#FFFCF9' },
      { border: border, text: "", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, color: '#6C6C6C', fillColor: '#FFFCF9' },
      { border: border, text: "", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, color: '#6C6C6C', fillColor: '#FFFCF9' },
      { border: border, text: "", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, color: '#6C6C6C', fillColor: '#FFFCF9' },
      { border: border, text: `${currencySymbol} ${exchangefee.toFixed(2)}`, margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, color: '#6C6C6C', fillColor: '#FFFCF9' }
    ]);
  }

}

toCalendarFormat = function (date) {
  return new DateService().calenderFormat(date);
}

logo = function () {
  let logo = new LogoService().qhLogo();
  return {
    image: logo, width: 150, height: 50
  }
}

companyAddress = function (company, address, postalCode, city, country) {
  return {
    border: [false, false, false, false],
    table: {
      widths: ['100%'],
      body: [
        [
          [
            { text: 'Issued by', fontSize: 11, bold: true, color: '#303030' },
            { text: '\n', fontSize: 5 },
            { text: company, fontSize: 10, bold: true, color: '#303030' },
            { text: address, fontSize: 10, color: '#6C6C6C' },
            { text: city, fontSize: 10, color: '#6C6C6C' },
            { text: country, fontSize: 10, color: '#6C6C6C' },
            { text: postalCode, fontSize: 10, color: '#6C6C6C' },
          ]
        ]
      ]
    },
    layout: { defaultBorder: false }
  };
};

clientAddress = function (companyName, address, postalCode, city, country) {
  return {
    border: [false, false, false, false],
    table: {
      widths: ['100%'],
      body: [
        [
          [
            { text: 'Client', fontSize: 11, bold: true, color: '#303030' },
            { text: '\n', fontSize: 5 },
            { text: companyName, fontSize: 10, bold: true, color: '#303030' },
            { text: address, fontSize: 10, color: '#6C6C6C' },
            { text: postalCode, fontSize: 10, color: '#6C6C6C' },
            { text: city, fontSize: 10, color: '#6C6C6C' },
            { text: country, fontSize: 10, color: '#6C6C6C' }
          ]
        ]
      ]
    },
    layout: { defaultBorder: false }
  };
};

paymentInformation = function (accountNumber, taxId, orderId, currencyName) {
  return {
    border: [false, false, false, false],
    table: {
      widths: ['100%'],
      body: [
        [
          [
            { text: 'Payment  ', fontSize: 11, bold: true, color: '#303030' },
            { text: '\n', fontSize: 5 },
            { text: [{ text: 'Account Number  ', fontSize: 10, bold: true, color: '#303030' }, { text: accountNumber, fontSize: 10, color: '#6C6C6C' }] },
            { text: [{ text: 'Tax ID Number  ', fontSize: 10, bold: true, color: '#303030' }, { text: taxId, fontSize: 10, color: '#6C6C6C' }] },
            { text: [{ text: 'Order Number  ', fontSize: 10, bold: true, color: '#303030' }, { text: orderId, fontSize: 10, color: '#6C6C6C' }] },
            { text: [{ text: 'Currency  ', fontSize: 10, bold: true, color: '#303030' }, { text: currencyName, fontSize: 10, color: '#6C6C6C' }] },
          ]
        ]
      ]
    },
    layout: { defaultBorder: false }
  }
};

invoiceTitle = function (invoiceId, invoiceType) {
  return {
    border: [false, false, false, false],
    table: {
      widths: ['100%'],
      headerRows: 1,
      body:
        [
          [
            [
              { text: invoiceType, fontSize: 16, color: '#EA663B' },
              { text: invoiceId, fontSize: 7, color: '#6C6C6C' },
              { text: '\n', fontSize: 5 }
            ]
          ]
        ]
    },
    layout: { defaultBorder: false }
  };
}

invoiceDates = function (issueDate, dueDate) {
  let border = [false, false, false, true];
  return {
    table: {
      widths: ['100%'],
      body: [
        [
          [
            [
              { border: border, text: [{ text: 'Issue Date  ', fontSize: 10, bold: true, color: '#303030' }, { text: issueDate, fontSize: 10, color: '#6C6C6C' }] },
            ],
            [
              { border: border, text: [{ text: 'Due Date  ', fontSize: 10, bold: true, color: '#303030' }, { text: dueDate, fontSize: 10, color: '#6C6C6C' }] },
            ],
            [
              { text: '\n', fontSize: 8 },
            ]
          ]
        ]
      ]
    },
    layout: { defaultBorder: false }
  };
}

invoiceHeader = function (invoice, client, company, payment) {
  return {
    border: [false, false, false, false],
    table: {
      widths: ['50%', '50%'],
      body: [
        [
          [
            marginBottom(2),
            drawLine(5, 383, 0, 0, 1.5, 'line', '#EA663B'),
            invoiceTitle(invoice.id, invoice.type),
            invoiceDates(invoice.issueDate, invoice.dueDate),
            drawLine(5, 383, 3, 3, 0.1, 'line'),
            marginBottom(3),
            clientAddress(client.company, client.address, client.postalCode, client.city, client.country),
            marginBottom(5),
            drawLine(5, 383, 0, 0, 0.1, 'line'),
            marginBottom(20)
          ],
          [
            marginBottom(2),
            companyAddress(company.name, company.address, company.postalCode, company.city, company.country),
            paymentInformation(payment.accountNumber, payment.taxId, payment.orderId, payment.currency),

          ]
        ]
      ]
    },
    layout: { defaultBorder: false }
  };
}

headerWithLogo = function (invoice, client, company, payment) {
  return {
    border: [false, false, false, false],
    table: {
      widths: ['20%', '7%', '73%'],
      body: [
        [
          [
            logo()
          ],
          [
            { text: '' }
          ],
          [
            invoiceHeader(invoice, client, company, payment)
          ]

        ]
      ]
    },
    layout: { defaultBorder: false }
  };
}

amountTable = function (serviceTotal, vatTotal, vatValue, invoiceTotal, discount, currency, totalLessDiscount) {
  let border = [false, false, false, true];
  let currencySymbol = currency.symbol;
  return {
    table: {
      alignment: 'center',
      widths: ['60%', '40%'],
      body: [
        [
          {
            border: [false, false, false, false],
            table: {
              widths: ['100%'],
              body: [
                { text: ' ' }
              ]
            }
          },
          {
            table: {
              widths: ['55%', '35%', '10%'],
              body: [
                [
                  { border: border, text: 'SUBTOTAL', fontSize: 10, color: '#6C6C6C' },
                  { border: border, text: `${currencySymbol} ${serviceTotal.toFixed(2)}`, fontSize: 10, alignment: 'right', color: '#6C6C6C' },
                  { border: border, text: currency.device, fontSize: 10, color: '#6C6C6C' }
                ],
                [
                  { border: border, text: 'DISCOUNT', fontSize: 10, color: '#6C6C6C' },
                  { border: border, text: discount, fontSize: 10, alignment: 'right', color: '#6C6C6C' },
                  { border: border, text: '%', fontSize: 10, color: '#6C6C6C' }
                ],
                [
                  { border: border, text: 'TOTAL', fontSize: 10, color: '#6C6C6C' },
                  { border: border, text: `${currencySymbol} ${totalLessDiscount.toFixed(2)}`, fontSize: 10, alignment: 'right', color: '#6C6C6C' },
                  { border: border, text: currency.device, fontSize: 10, color: '#6C6C6C' }
                ],
                [
                  { border: border, text: 'TAX RATE', fontSize: 10, color: '#6C6C6C' },
                  { border: border, text: vatValue * 100, fontSize: 10, alignment: 'right', color: '#6C6C6C' },
                  { border: border, text: '%', fontSize: 10, color: '#6C6C6C' },
                ],
                [
                  { border: border, text: 'TOTAL TAX', fontSize: 10, color: '#6C6C6C' },
                  { border: border, text: `${currencySymbol} ${vatTotal.toFixed(2)}`, fontSize: 10, alignment: 'right', color: '#6C6C6C' },
                  { border: border, text: currency.device, fontSize: 10, color: '#6C6C6C' }
                ],
                [
                  { border: [false, false, false, false], text: 'BALANCE DUE', fontSize: 10, bold: true, color: '#EA663B' },
                  { border: [false, false, false, false], text: `${currencySymbol} ${invoiceTotal.toFixed(2)}`, fontSize: 10, bold: true, alignment: 'right', color: '#ffffff', fillColor: '#EA663B' },
                  { border: [false, false, false, false], text: currency.device, fontSize: 10, color: '#ffffff', fillColor: '#EA663B' }
                ],
              ]
            },
            layout: { defaultBorder: false }
          },
        ]
      ]
    },
    layout: { defaultBorder: false }
  };
};

bottom = function (currency, country, vatok) {
  return {
    border: [false, false, false, false],
    table: {
      widths: ['100%'],
      widths: ['100%'],
      body: [[[
        drawLine(5, 580, -5, -5, 1, 'line', '#F6F6F6'),
        { text: ' Wire transfer ', bold: true, fontSize: 9, color: '#303030' },
        wireTransfer(currency, country, vatok),
        contactInformation(),
        drawLine(5, 580, 0, 0, 1, 'line', '#EA663B')
      ]]]
    },
    layout: { defaultBorder: false }
  };
};

drawLine = function (x1, x2, y1, y2, lineWidth, type, color = '#000000') {
  return {
    canvas: [
      {
        type: type,
        x1: x1, y1: y1,
        x2: x2, y2: y2,
        lineWidth: lineWidth,
        lineColor: color
      }
    ]
  }
}

marginBottom = function (value) {
  return {
    text: '\n', fontSize: value,
  }
}

contactInformation = function () {
  return {
    border: [false, false, false, false],
    table: {
      widths: ['30%', '30%', '40%'],
      body: [
        [
          [
            { text: '+ 33 1 73 02 32 15', fontSize: 9, bold: true, color: '#303030' }
          ],
          [
            { text: 'accounts-receivable@quanthouse.com', fontSize: 9, bold: true, color: '#303030' }
          ],
          [
            { text: '' }
          ]
        ]
      ]
    },
    layout: { defaultBorder: false }
  }
}

generalPaymentTerms = function () {
  return {
    border: [false, false, false, false],
    table: {
      alignment: 'center',
      widths: ['59%', '41%'],
      body: [
        [
          {
            border: [false, false, false, false],
            table: {
              widths: ['100%'],
              body: [
                { text: ' ' }
              ]
            }
          },
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  [
                    {
                      widths: ['100%'],
                      table: {
                        body: concatGeneralTerms(['The amount must be paid in full without deducting any bank charges',
                          'No discount for early payment',
                          'Late payment fee equal to 1.5 times the French legal rate of interest, form the due date until the date of payment',
                          'Surchage of EUR 40 for collection costs in case of late payment',
                          'To ensure proper credit, please quote invoice # with your remittance or send remittance advice to accounts-receivable@quanthouse.com'])
                      },
                      layout: { defaultBorder: false }
                    }
                  ]
                ]
              ]
            },
            layout: { defaultBorder: false }
          },
        ]
      ]
    },
    layout: { defaultBorder: false }
  }
}

function vatType(country, vatok) {
  if (country.id === 'FR' || (country.ue === '1' && !vatok)) {
    return "VAT payment based on invoicing";
  }
  if (country.ue === '1' && vatok) {
    return "Reverse-charge";
  }
  if (country.ue === '0') {
    return "Outside the territorial scope – Article 44 of Directive 2006/112/EC";
  }
}


concatGeneralTerms = function (terms) {
  let termsList = [];
  termsList.push([{ text: 'General payment terms', bold: true, fontSize: 9, color: '#303030', fillColor: '#F6F6F6' }]);
  terms.forEach(term => {
    termsList.push([{ text: '- ' + term, fontSize: 9, color: '#6C6C6C', fillColor: '#F6F6F6' }]);
  });
  return termsList;
};


wireTransfer = function (currency, country, vatok) {
  const beneficiaryName = 'Quanthouse';
  const beneficiaryAddress = '86 boulevard Haussmann - 75008 PARIS - FRANCE';
  const vat = 'FR00449703248';
  let bic = 'BIC Code :';
  let bank = 'Receiving Bank Name :';
  let iban = 'IBAN :';
  let sasu = 'SASU au capital de 14.108.818 €';
  let rcs = 'RCS Paris 449703248';

  if (currency.id == 'usd' || currency.id == 'gbp') {
    bic = '';
    bank = '';
    iban = '';
  }
  return {
    widths: ['30%', '10%', '25%', '10%', '25%'],
    table: {
      body: [[
        [
          [{ text: [{ text: 'Beneficiary Name : ', fontSize: 8, bold: true, color: '#303030' }, { text: beneficiaryName, fontSize: 8, color: '#6C6C6C' }] }],
          [{ text: [{ text: 'Beneficiary Address : ', fontSize: 8, bold: true, color: '#303030' }, { text: beneficiaryAddress, fontSize: 8, color: '#6C6C6C' }] }],
          [{ text: [{ text: 'VAT : ', fontSize: 8, bold: true, color: '#303030' }, { text: vat, fontSize: 8, color: '#6C6C6C' }] }]
        ],
        [
          { text: '' }
        ],
        [
          [{ text: sasu, fontSize: 8, color: '#6C6C6C' }],
          [{ text: rcs, fontSize: 8, color: '#6C6C6C' }],
          [{ text: vatType(country, vatok), fontSize: 8, color: '#6C6C6C' }]
        ],
        [
          { text: '' }
        ],
        [
          [{ text: [{ text: bic, fontSize: 8, bold: true, color: '#303030' }, { text: currency.bic, fontSize: 8, color: '#6C6C6C' }] }],
          [{ text: [{ text: bank, fontSize: 8, bold: true, color: '#303030' }, { text: currency.rib.domiciliation, fontSize: 8, color: '#6C6C6C' }] }],
          [{ text: [{ text: iban, fontSize: 8, bold: true, color: '#303030' }, { text: currency.iban.ib1 + ' ' + currency.iban.ib2 + ' ' + currency.iban.ib3 + ' ' + currency.iban.ib4 + ' ' + currency.iban.ib5 + ' ' + currency.iban.ib6 + ' ' + currency.iban.ib7, fontSize: 8, color: '#6C6C6C' }] }]
        ]
      ]
      ]
    },
    layout: { defaultBorder: false }
  };
};
