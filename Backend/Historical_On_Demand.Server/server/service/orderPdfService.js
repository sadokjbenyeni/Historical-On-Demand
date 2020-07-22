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
const invoiceDirectory = global.environment.InvoiceDirectory;

module.exports = function (order) {
  this.order = order;

  this.createInvoicePdf = async function (logger, invoiceId, invoiceType) {
    logger.info({ message: "creating invoice in pdf...", className: "Order PDF Service" });
    var user = await User.findOne({ _id: this.order.userId }).exec();
    var country = await Country.findOne({ id: this.order.countryBilling }).exec();
    var currency = await Currency.findOne({ id: this.order.currency }).exec();
    this.generatePdfFile(logger, currency, user, country, invoiceId, invoiceType);
    return true;
  }

  this.generatePdfFile = function (logger, currency, user, country, invoiceId, invoiceType) {
    let fonts = {
      AppleGaramond: {
        normal: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['AppleGaramond-Light.ttf'], 'base64'),
        bold: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['AppleGaramond.ttf'], 'base64'),
        italics: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['AppleGaramond-LightItalic.ttf'], 'base64'),
        bolditalics: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['AppleGaramond-Italic.ttf'], 'base64')
      }
    };
    printer = new pdfMake(fonts);
    style = {
      // Document Header
      datacmd: { alignment: 'right' },
      documentHeaderLeft: { fontSize: 10, margin: [0, 0, 0, 0], alignment: 'left' },
      documentHeaderCenter: { fontSize: 10, margin: [0, 0, 0, 0], alignment: 'center' },
      documentHeaderRight: { fontSize: 10, margin: [0, 0, 0, 0], alignment: 'right' },
      // Document Footer
      documentFooterLeft: { fontSize: 10, margin: [0, 0, 0, 0], alignment: 'left' },
      documentFooterCenter: { fontSize: 10, margin: [0, 0, 0, 0], alignment: 'center' },
      documentFooterRight: { fontSize: 10, margin: [0, 0, 0, 0], alignment: 'right' },
      // Invoice Title
      invoiceTitle: { fontSize: 22, bold: true, alignment: 'right', margin: [0, 0, 0, 15] },
      // Invoice Details
      invoiceSubTitle: { fontSize: 10, alignment: 'left' },
      invoiceSubValue: { fontSize: 10, alignment: 'right' },
      // Billing Headers
      invoiceBillingTitle: { fontSize: 14, bold: true, alignment: 'left', margin: [0, 20, 0, 5], },
      // Billing Details
      invoiceBillingDetails: { alignment: 'left' },
      invoiceBillingAddressTitle: { fontSize: 10, margin: [5, 5, 5, 5] },
      invoiceBillingAddress: { fontSize: 8, margin: [5, 5, 5, 5] },
      // Items Header
      itemsHeader: { margin: [0, 5, 0, 5], bold: true },
      // Item Title
      itemTitle: { bold: true, },
      // itemSubTitle: { italics: true, fontSize: 8},
      itemSubTitle: { fontSize: 8, },
      itemNumber: { margin: [0, 5, 0, 5], alignment: 'center', },
      itemTotal: { margin: [0, 5, 0, 5], bold: true, alignment: 'center', },

      // Items Footer (Subtotal, Total, Tax, etc)
      itemsFooterSubTitle: { margin: [0, 5, 0, 5], bold: true, alignment: 'right', fontSize: 10 },
      itemsFooterSubValue: { margin: [0, 5, 0, 5], bold: true, alignment: 'center', fontSize: 10 },
      itemsFooterTotalTitle: { margin: [0, 5, 0, 5], bold: true, alignment: 'right', fontSize: 10 },
      itemsFooterTotalValue: { margin: [0, 5, 0, 5], bold: true, alignment: 'center', fontSize: 10 },
      signaturePlaceholder: { margin: [0, 70, 0, 0], },
      signatureName: { bold: true, alignment: 'center', },
      signatureJobTitle: { italics: true, fontSize: 10, alignment: 'center', },
      notesTitle: { fontSize: 10, bold: true, margin: [0, 50, 0, 3] },
      notesText: { fontSize: 10 },
      center: { alignment: 'center' },
    };

    let invoice = {};
    let content = [];
    let defaultStyle = {
      font: 'AppleGaramond'
    };
    var invoiceInformation = { id: invoiceId, type: invoiceType, issueDate: toCalendarFormat(new Date()), dueDate: toCalendarFormat(this.order.submissionDate) };
    var client = { company: this.order.companyName, address: this.order.addressBilling, postalCode: this.order.postalCodeBilling, city: this.order.cityBilling, country: this.order.countryBilling };
    var company = { name: 'QUANTHOUSE', address: '86 boulevard Haussmann', postalCode: '75008', city: 'Paris', country: 'France' };
    var payment = { accountNumber: user.id, taxId: this.order.vat, orderId: this.order.orderId, currency: currency.name };
    const discountValue = this.order.totalHTDiscountFree - this.order.totalHT;

    content.push(
      headerWithLogo(invoiceInformation, client, company, payment),
      orderTableHeader(),
      getOrders(this.order.products, this.order.vatValue, country),
      marginBottom(10),
      amountTable(this.order.totalHT, this.order.totalVat, this.order.vatValue, this.order.total, discountValue, currency),
      generalPaymentTerms(),
      drawLine(340, 560, 0, 0, 0.01, 'line')

    );
    let paginator = {};
    paginator = function (currentPage, totalPage) {
      return [{ text: currentPage.toString() + ' of ' + totalPage, alignment: 'center', fontSize: 8 }]
    };
    let footer = []
    let sasu = 'SASU au capital de 14.108.818 €';
    let rcs = 'RCS Paris 449703248';
    let vat = 'VAT : FR00449703248';
    footer = bottom(currency, country, this.order.vatValide, sasu, rcs);
    invoice['style'] = style;
    invoice['pageMargins'] = [15, 15, 15, 80];
    invoice['defaultStyle'] = defaultStyle;
    invoice['page'] = paginator;
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

condition = function (conditions) {
  let tabCondition = [];
  tabCondition.push([{ text: 'General payment terms', bold: true, fontSize: 9 }]);
  conditions.forEach(cond => {
    tabCondition.push([{ text: '- ' + cond, fontSize: 9 }]);
  });
  return tabCondition;
};

wireTransfer = function (currency, sasu, rcs, country, vatok) {
  const beneficiaryName = 'Quanthouse';
  const beneficiaryAddress = '86 boulevard Haussmann - 75008 PARIS - FRANCE';
  const vat = 'FR00449703248';
  let bic = 'BIC Code :';
  let bank = 'Receiving Bank Name :';
  let iban = 'IBAN :';

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
          [{ text: [{ text: 'Beneficiary Name : ', fontSize: 9, bold: true }, { text: beneficiaryName, fontSize: 9 }] }],
          [{ text: [{ text: 'Beneficiary Address : ', fontSize: 9, bold: true }, { text: beneficiaryAddress, fontSize: 9 }] }],
          [{ text: [{ text: 'VAT : ', fontSize: 9, bold: true }, { text: vat, fontSize: 9 }] }]
        ],
        [
          { text: '' }
        ],
        [
          [{ text: sasu, fontSize: 9 }],
          [{ text: rcs, fontSize: 9 }],
          [{ text: vatType(country, vatok), fontSize: 9 }]
        ],
        [
          { text: '' }
        ],
        [
          [{ text: [{ text: bic, fontSize: 9, bold: true }, { text: currency.bic, fontSize: 9 }] }],
          [{ text: [{ text: bank, fontSize: 9, bold: true }, { text: currency.rib.domiciliation, fontSize: 9 }] }],
          [{ text: [{ text: iban, fontSize: 9, bold: true }, { text: currency.iban.ib1 + ' ' + currency.iban.ib2 + ' ' + currency.iban.ib3 + ' ' + currency.iban.ib4 + ' ' + currency.iban.ib5 + ' ' + currency.iban.ib6 + ' ' + currency.iban.ib7, fontSize: 9 }] }]
        ]
      ]
      ]
    },
    layout: { defaultBorder: false }
  };
};

orderTableHeader = function () {
  let border = [false, false, false, true];
  return {
    table: {
      headerRows: 1,
      widths: [240, 40, 65, 65, 100],
      margin: [0, 5, 0, 5],
      body: [
        [
          { border: border, text: 'DESCRIPTION', margin: [0, 5, 0, 5], bold: true, alignment: 'center' },
          { border: border, text: 'UNITS', margin: [0, 5, 0, 5], bold: true, alignment: 'center' },
          { border: border, text: 'FROM', margin: [0, 5, 0, 5], bold: true, alignment: 'center' },
          { border: border, text: 'TO', margin: [0, 5, 0, 5], bold: true, alignment: 'center' },
          { border: border, text: 'TOTAL', margin: [0, 5, 0, 5], bold: true, alignment: 'center' }
        ],
      ]
    },
    layout: { defaultBorder: false }
  }
}

function getOrders(orders, vatValue, country) {
  var pervat = country.ue === "1" ? vatValue : 0;
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
        addProduct(listOrders, product, eid.exchangefee, border, pervat, colorCounter);
        colorCounter++;
      });
    })
  }
  return {
    table: {
      headerRows: 0,
      widths: [240, 40, 65, 65, 100],
      margin: [0, 5, 0, 5],
      body: listOrders
    },
    layout: { defaultBorder: false }
  }
};

function addProduct(listOrders, product, exchangefee, border, pervat, colorCounter) {
  let description = product.description ? product.description : product.contractid;
  var typeOrder = product.onetime === 1 ? "One-Off" : "Subscription";
  var dateDebut = product.onetime === 1 ? toCalendarFormat(product.begin_date) : toCalendarFormat(product.begin_date_ref);
  var dateFin = product.onetime === 1 ? toCalendarFormat(product.end_date) : toCalendarFormat(product.end_date_ref);
  var dataset = product.dataset === "L1TRADEONLY" ? "L1 - Trades" : product.dataset
  let backgroundColor = colorCounter % 2 == 0 ? "#f7fcfc" : "#ffffff";
  listOrders.push([
    { border: border, text: product.idx + '\t' + typeOrder + " " + dataset, fontSize: 10, fillColor: backgroundColor },
    { border: border, text: "1", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, fillColor: backgroundColor },
    { border: border, text: dateDebut, margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, fillColor: backgroundColor },
    { border: border, text: dateFin, margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, fillColor: backgroundColor },
    { border: border, text: product.ht.toFixed(2), margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10, fillColor: backgroundColor },
  ]);
  if (product.backfill_fee > 0 || product.ongoing_fee > 0) {
    listOrders.push([
      { border: border, text: "\tExchanges fees", margin: [0, 5, 0, 5], fontSize: 10 },
      { border: border, text: "", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
      { border: border, text: "", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
      { border: border, text: "", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
      { border: border, text: exchangefee.toFixed(2), margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 }
    ]);
  }

}

insertLineCarriage = function (sentence, insertPostion) {
  if (insertPostion > 10) return sentence.slice(0, insertPostion) + '\n' + sentence.slice(insertPostion);
  else return sentence;
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
            { text: 'Issued by', fontSize: 11, bold: true },
            { text: '\n', fontSize: 5 },
            { text: company, fontSize: 10, bold: true },
            { text: address, fontSize: 10 },
            { text: city, fontSize: 10 },
            { text: country, fontSize: 10 },
            { text: postalCode, fontSize: 10 },
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
            { text: 'Client', fontSize: 11, bold: true },

            { text: '\n', fontSize: 5 },
            { text: companyName, fontSize: 10, bold: true },
            { text: address, fontSize: 10 },
            { text: postalCode, fontSize: 10 },
            { text: city, fontSize: 10 },
            { text: country, fontSize: 10 }
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
            { text: 'Payment  ', fontSize: 11, bold: true },
            { text: '\n', fontSize: 5 },
            { text: [{ text: 'Account Number  ', fontSize: 10, bold: true }, { text: accountNumber, fontSize: 10 }] },
            { text: [{ text: 'Tax ID Number  ', fontSize: 10, bold: true }, { text: taxId, fontSize: 10 }] },
            { text: [{ text: 'Order Number  ', fontSize: 10, bold: true }, { text: orderId, fontSize: 10 }] },
            { text: [{ text: 'Currency  ', fontSize: 10, bold: true }, { text: currencyName, fontSize: 10 }] },
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
              { text: invoiceType, fontSize: 20, bold: true },
              { text: invoiceId, fontSize: 10 },
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
              { border: border, text: [{ text: 'Issue Date  ', fontSize: 10, bold: true }, { text: issueDate, fontSize: 10 }] },
            ],
            [
              { border: border, text: [{ text: 'Due Date  ', fontSize: 10, bold: true }, { text: dueDate, fontSize: 10 }] },
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
            drawLine(5, 400, 0, 0, 1.5, 'line'),
            invoiceTitle(invoice.id, invoice.type),
            invoiceDates(invoice.issueDate, invoice.dueDate),
            drawLine(5, 400, 0, 0, 0.1, 'line'),
            clientAddress(client.company, client.address, client.postalCode, client.city, client.country),
            drawLine(5, 400, 0, 0, 0.1, 'line'),
            marginBottom(20)
          ],
          [
            marginBottom(2),
            companyAddress(company.name, company.address, company.postalCode, company.city, company.country),
            marginBottom(4),
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
      widths: ['25%', '75%'],
      body: [
        [
          [
            logo()
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

amountTable = function (serviceTotal, vatTotal, vatValue, invoiceTotal, discount, currency) {
  let border = [false, false, false, true];
  let currencySymbol = currencySymbolToCodeConverter(currency);
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
              widths: ['35%', '55%', '10%'],
              body: [
                [
                  { border: border, text: 'SUBTOTAL', fontSize: 10, style: 'itemsFooterSubTitle' },
                  { border: border, text: currencySymbol + serviceTotal.toFixed(2), fontSize: 10, style: 'itemsFooterSubValue', alignment: 'right' },
                  { border: border, text: currency.device, fontSize: 10, style: 'itemsFooterSubValue' }
                ],
                [
                  { border: border, text: 'TOTAL TAX', fontSize: 10, style: 'itemsFooterSubTitle' },
                  { border: border, text: currencySymbol + vatTotal.toFixed(2), fontSize: 10, style: 'itemsFooterSubValue', alignment: 'right' },
                  { border: border, text: currency.device, fontSize: 10, style: 'itemsFooterSubValue' }
                ],

                [
                  { border: border, text: 'TAX RATE', fontSize: 10, style: 'itemsFooterSubTitle' },
                  { border: border, text: vatValue * 100, fontSize: 10, style: 'itemsFooterSubValue', alignment: 'right' },
                  { border: border, text: '%', fontSize: 10, style: 'itemsFooterSubValue' },
                ],
                [
                  { border: border, text: 'DISCOUNT', fontSize: 10, style: 'itemsFooterSubTitle' },
                  { border: border, text: currencySymbol + discount.toFixed(2), fontSize: 10, style: 'itemsFooterSubValue', alignment: 'right' },
                  { border: border, text: currency.device, fontSize: 10, style: 'itemsFooterSubValue' }
                ],
                [
                  { border: border, text: 'BALANCE DUE', fontSize: 10, style: 'itemsFooterTotalTitle', bold: true },
                  { border: border, text: currencySymbol + invoiceTotal.toFixed(2), fontSize: 10, style: 'itemsFooterTotalValue', bold: true, alignment: 'right' },
                  { border: border, text: currency.device, fontSize: 10, style: 'itemsFooterSubValue' }
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

bottom = function (currency, country, vatok, sasu, rcs) {
  return {
    border: [false, false, false, false],
    table: {
      widths: ['100%'],
      widths: ['100%'],
      body: [[[
        { text: ' Wire transfer ', bold: true, fontSize: 10 },
        wireTransfer(currency, sasu, rcs, country, vatok),
        contactInformation(),
        drawLine(5, 580, 0, 0, 1, 'line')
      ]]]
    },
    layout: { defaultBorder: false }
  };
};

drawLine = function (x1, x2, y1, y2, lineWidth, type) {
  return {
    canvas: [
      {
        type: type,
        x1: x1, y1: y1,
        x2: x2, y2: y2,
        lineWidth: lineWidth
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
      widths: ['25%', '25%', '50%'],
      body: [
        [
          [
            { text: '+ 33 1 73 02 32 15', fontSize: 9 }
          ],
          [
            { text: 'accounts-receivable@quanthouse.com', fontSize: 9 }
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

currencySymbolToCodeConverter = function (currency) {
  if (currency.name == "American Dollar") {
    return String.fromCharCode(36);
  }
  else if (currency.name == "Euro") {
    return String.fromCharCode(128);
  }
  else if (currency.name == "Pound Sterling") {
    return String.fromCharCode(163);
  }
}

generalPaymentTerms = function (country, vatok) {
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
                        body: condition(['The amount must be paid in full without deducting any bank charges',
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
