const mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
var pdfMake = require('pdfmake/src/printer');
const User = mongoose.model('User');
const Currency = mongoose.model('Currency');
const Country = mongoose.model('Countrie');
const DateService = require('../service/dateService');
const LogoService = require('./logoService');
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
      Roboto: {
        normal: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
        bold: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
        italics: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
        bolditalics: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64')
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
      invoiceBillingAddressTitle: { margin: [0, 7, 0, 3], bold: true },
      invoiceBillingAddress: {},
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
    let header = function (currentPage, pageCount) {
      return [{ text: currentPage.toString() + ' of ' + pageCount, alignment: 'center', fontSize: 8 }]
    };
    let content = [];
    let defaultStyle = {};
    // Header
    content.push(
      this.address(invoiceId, user.id, this.order.vat, toCalendarFormat(new Date()), toCalendarFormat(this.order.submissionDate), this.order.orderId, currency.name, invoiceType),
      '\n',
      this.billingAddress(this.order.companyName, this.order.addressBilling, this.order.postalCodeBilling, this.order.cityBilling, this.order.countryBilling),
      '\n',
      {
        table: {
          headerRows: 1,
          widths: [200, 30, 65, 65, 100, 50],
          margin: [0, 0, 0, 0],
          body: [
            [
              { text: 'Description', margin: [0, 5, 0, 5], bold: true, alignment: 'center' },
              { text: 'Units', margin: [0, 5, 0, 5], bold: true, alignment: 'center' },
              { text: 'From', margin: [0, 5, 0, 5], bold: true, alignment: 'center' },
              { text: 'To', margin: [0, 5, 0, 5], bold: true, alignment: 'center' },
              { text: 'Services total', margin: [0, 5, 0, 5], bold: true, alignment: 'center' },
              { text: 'VAT Rate', margin: [0, 5, 0, 5], bold: true, alignment: 'center' }
            ],
          ]
        },
      },
      {
        table: {
          headerRows: 0,
          widths: [200, 30, 65, 65, 100, 50],
          margin: [0, 0, 0, 0],
          body: getOrders(this.order.products, this.order.vatValue, country, user)
        },
        layout: { defaultBorder: false }
      },
      '\n',
      this.footer(logger, this.order.totalHT, this.order.totalVat, this.order.total, currency, country, this.order.vatValide)
    );

    invoice['style'] = style;
    invoice['pageMargins'] = [15, 15, 15, 15];
    invoice['defaultStyle'] = defaultStyle;
    invoice['header'] = header;
    invoice['content'] = content;

    //Création du document PDF
    let pdfDoc = printer.createPdfKitDocument(invoice);

    var directory = invoiceDirectory;
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    pdfDoc.pipe(fs.createWriteStream(path.join(directory, invoiceId + '.pdf')));
    pdfDoc.end();
  };

  this.address = function (invoiceId, numAccount, idTax, invoiceDate, paymentDate, numCmd, currency, invoiceType) {
    return {
      columns: [
        [{ image: setLogo(), width: 150, height: 50 },
        this.qhAddress(
          '86 boulevard Haussmann',
          '75008',
          'PARIS',
          'FRANCE',
          'SASU au capital de 14.108.818 €',
          'RCS Paris 449703248',
          'VAT : FR00449703248'
        ),],
        this.head(invoiceId, numAccount, idTax, invoiceDate, paymentDate, numCmd, currency, invoiceType)
      ],
    }
  };

  this.qhAddress = function (address, postalCode, city, country, sasu, rcs, vat, invoiceBillingAddress) {
    return {
      text: address + '\n' + postalCode + ' ' + city + '\n' + country + '\n' + sasu + '\n' + rcs + '\n' + vat,
      style: invoiceBillingAddress
    };
  };

  this.billingAddress = function (companyName, address, postalCode, city, country) {
    return {
      text: companyName + '\n' + address + '\n' + postalCode + ' ' + city + '\n' + country,
      style: 'invoiceBillingAddress'
    };
  };

  this.tabSum = function (serviceTotal, vatTotal, invoiceTotal, currency) {
    // pensez à mettre les discount
    return {
      table: {
        widths: ['33%', '55%', '10%'],
        body: [
          [
            { text: 'Services total', style: 'itemsFooterSubTitle' },
            { text: serviceTotal.toFixed(2), style: 'itemsFooterSubValue', alignment: 'right' },
            { text: currency, style: 'itemsFooterSubValue' }
          ],
          [
            { text: 'VAT total', style: 'itemsFooterSubTitle' },
            { text: vatTotal.toFixed(2), style: 'itemsFooterSubValue', alignment: 'right' },
            { text: currency, style: 'itemsFooterSubValue' }
          ],
          [
            { text: 'Invoice total', style: 'itemsFooterTotalTitle' },
            { text: invoiceTotal.toFixed(2), style: 'itemsFooterTotalValue', alignment: 'right' },
            { text: currency, style: 'itemsFooterSubValue' }
          ],
        ]
      }
    };
  };

  this.condition = function (conditions) {
    let tabCondition = [];
    tabCondition.push([{ text: 'General payment terms', fillColor: '#dddddd', fontSize: 8, }]);
    conditions.forEach(cond => {
      tabCondition.push([{ text: '- ' + cond, fontSize: 8, }]);
    });
    return tabCondition;
  };

  this.contact = function (tel, email) {
    return [
      { text: tel, fontSize: 8 },
      { text: email, link: email, color: '#3a65ff', fontSize: 8 }
    ];
  };

  this.productMessage = function (message) {
    if (message) {
      return [{ colSpan: 2, fillColor: '#dddddd', text: message, fontSize: 8 }, ''];
    } else {
      return [{ colSpan: 2, fillColor: '#FFFFFF', text: '', fontSize: 8 }, ''];
    }
  };

  this.wireTransfer = function (vat, delay, c) {
    return {
      widths: ['100%'],
      table: {
        body: [
          [{ text: 'Wire transfer', fillColor: '#dddddd', fontSize: 8, }],
          [{ text: 'Beneficiary Name : ' + 'Quanthouse', fontSize: 8, }],
          [{ text: 'Beneficiary Address : ' + '86 boulevard Haussmann' + ' - ' + '75009' + ' ' + 'PARIS' + ' - ' + 'FRANCE', fontSize: 8, }],
          [{ text: 'Receiving Bank Name : ' + c.rib.domiciliation, fontSize: 8, }],
          [{ text: 'IBAN : ' + c.iban.ib1 + ' ' + c.iban.ib2 + ' ' + c.iban.ib3 + ' ' + c.iban.ib4 + ' ' + c.iban.ib5 + ' ' + c.iban.ib6 + ' ' + c.iban.ib7, fontSize: 8, }],
          [{ text: 'BIC Code : ' + c.bic, fontSize: 8, }],
          [{ text: vat, fontSize: 8, }],
          [{ text: 'Payment ' + delay + ' days', fontSize: 8, }],
          [{ text: 'Currency : ' + c.name.toLocaleUpperCase(), fontSize: 8, }],
        ]
      },
      layout: { defaultBorder: false }
    };
  };

  this.head = function (invoiceId, numAccount, idTax, invoiceDate, paymentDate, numCmd, currency, invoiceType) {
    let width = '50%';
    return {
      table: {
        body: [
          [
            { text: invoiceType, style: 'invoiceSubTitle', width: width },
            { text: insertLineCarriage(invoiceId, invoiceType.length - 2), style: 'invoiceSubValue', width: width }
          ],
          [
            { text: 'Account n°', style: 'invoiceSubTitle', width: width },
            { text: numAccount, style: 'invoiceSubValue', width: width }
          ],
          [
            { text: 'tax Id n°', style: 'invoiceSubTitle', width: width },
            { text: idTax, style: 'invoiceSubValue', width: width }
          ],
          [
            { text: 'Invoice date', style: 'invoiceSubTitle', width: width },
            { text: invoiceDate, style: 'invoiceSubValue', width: width }
          ],
          [
            { text: 'Payment due date', style: 'invoiceSubTitle', width: width },
            { text: paymentDate, style: 'invoiceSubValue', width: width }
          ],
          [
            { text: 'Order form n°', style: 'invoiceSubTitle', width: width },
            { text: numCmd, style: 'invoiceSubValue', width: width }
          ],
          [
            { text: 'Currency', style: 'invoiceSubTitle', width: width },
            { text: currency, style: 'invoiceSubValue', width: width }
          ]
        ]
      }
    }
  };

  this.footer = function (logger, totalHt, totalVat, totalTTC, currency, country, vatok) {
    logger.info({ message: country, className: 'PDF Api' });
    let mentionvat = "";
    if (country.id === 'FR' || (country.ue === '1' && !vatok)) {
      mentionvat = "VAT payment based on invoicing";
    }
    if (country.ue === '1' && vatok) {
      mentionvat = "Reverse-charge";
    }
    if (country.ue === '0') {
      mentionvat = "Outside the territorial scope – Article 44 of Directive 2006/112/EC";
    }
    return {
      table: {
        alignment: 'center',
        widths: ['50%', '50%'],
        body: [
          this.productMessage(""),
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
                      { text: '\n', fontSize: 10 },
                      { text: mentionvat, fontSize: 8 },
                      { text: '\n', fontSize: 16 },
                      {
                        widths: ['100%'],
                        table: { body: this.condition(['the amount must be paid in full without deducting any bank charges', 'no discount for early payment', 'late payment fee equal to 1.5 times the French legal rate of interest, form the due date until the date of payment', 'surchage of EUR 40 for collection costs in case of late payment', 'to ensure proper credit, please quote invoice # with your remittance or send remittance advice to accounts-receivable@quanthouse.com']) },
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
                body: [[[
                  this.tabSum(totalHt, totalVat, totalTTC, currency.symbol),
                  { text: '\n', fontSize: 8 },
                  this.wireTransfer("VAT", "delay", currency)
                ]]]
              },
              layout: { defaultBorder: false }
            }
          ]
        ]
      },
      layout: { defaultBorder: false }
    };
  };

  function getOrders(orders, vatValue, country) {
    var pervat = country.ue === "1" ? vatValue : 0;
    let listOrders = [];
    let border = [false, false, false, true];
    orders.forEach(
      eid => {
        eid.allproducts = eid.subscription.concat(eid.onetime)
      })
    if (orders.length > 0) {
      orders.forEach(eid => {
        eid.allproducts.forEach(product => {
          addProduct(listOrders, product, eid.exchangefee, border, pervat);
        });
      })
    }
    return listOrders;
  };

  function addProduct(listOrders, product, exchangefee, border, pervat) {
    let description = product.description ? product.description : product.contractid;
    var typeOrder = product.onetime === 1 ? "One-Off" : "Subscription";
    var dateDebut = product.onetime === 1 ? toCalendarFormat(product.begin_date) : toCalendarFormat(product.begin_date_ref);
    var dateFin = product.onetime === 1 ? toCalendarFormat(product.end_date) : toCalendarFormat(product.end_date_ref);
    var dataset = product.dataset === "L1TRADEONLY" ? "L1 - Trades" : product.dataset
    listOrders.push([
      {
        border: border,
        text: product.idx + '\t' + typeOrder + " " + dataset + "\n" + description,
        fontSize: 10
      },
      { border: border, text: "1", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
      { border: border, text: dateDebut, margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
      { border: border, text: dateFin, margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
      { border: border, text: product.ht.toFixed(2), margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
      { border: border, text: (pervat * 100) + '%', margin: [0, 5, 0, 5], bold: true, alignment: 'center', fontSize: 10 }
    ]);

    if (product.backfill_fee > 0 || product.ongoing_fee > 0) {
      listOrders.push([
        { border: border, text: "\tExchanges fees", margin: [0, 5, 0, 5], fontSize: 10 },
        { border: border, text: "", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
        { border: border, text: "", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
        { border: border, text: "", margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
        { border: border, text: exchangefee.toFixed(2), margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
        { border: border, text: (pervat * 100) + '%', margin: [0, 5, 0, 5], bold: true, alignment: 'center', fontSize: 10 }
      ]);
    }
  }
}

insertLineCarriage = function (sentence, insertPostion) {
  if (insertPostion > 10) return sentence.slice(0, insertPostion) + '\n' + sentence.slice(insertPostion);
  else return sentence;
}
toCalendarFormat = function (date) {
  return new DateService().calenderFormat(date);
}
setLogo = function () {
  return new LogoService().qhLogo();
}