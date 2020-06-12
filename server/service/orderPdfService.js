const mongoose = require('mongoose');

var path = require('path');
var fs = require('fs');
var pdfMake = require('pdfmake/src/printer');
const User = mongoose.model('User');
const Currency = mongoose.model('Currency');
const Countrie = mongoose.model('Countrie');

const config = require('../config/config.js');
const DOMAIN = config.domain();

module.exports = function (logger, order) {
    this.order = order;
    this.logger = logger;

    this.createInvoicePdf = async function(){
        // var order = await Order.findOne({ id: req.body.id }).exec() //.then(cmd => {
        var user = await User.findOne({ _id: this.order.idUser }, { id: true, vat: true, countryBilling: true, checkvat: true }).exec(); //.then(u => {
        var country = await Countrie.findOne({ id: this.order.countryBilling }).exec(); //.then(cnt => {
        var currency = await Currency.findOne({ id: this.order.currency }).exec(); // .then(c => {
        pdf(req.logger, order, currency, user, country);
        // testoo(req.logger, user);
        //         });
        //       });
        //     });
        //   });
    }

    this.pdf = function (logger, order, currency, user, country) {
        let fonts = {
          Roboto: {
            normal: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
            bold: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
            italics: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
            bolditalics: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64')
          }
        };
        printer = new pdfMake(fonts);
        //Styles
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
          adresse(order.idCommande, user.id, order.vat, new Date(), order.logsPayment[0].date.yyyymmdd(), order.id, currency.name),
          // Billing Address
          '\n',
          billinAddress(order.companyName, order.addressBilling, order.postalCodeBilling, order.cityBilling, order.countryBilling),
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
              body: getOrders(order.products, order.vatValue, style, order.currency, order.currencyTxUsd, order.currencyTx, country, user)
            },
            layout: { defaultBorder: false }
          }
        );
      
        invoice['pageMargins'] = [15, 15, 15, 230];
        invoice['style'] = style;
        invoice['defaultStyle'] = defaultStyle;
        invoice['header'] = header;
        invoice['content'] = content;
        let totalHT = priceCurrency(order.totalHT + order.totalExchangeFees, order.currency, order.currencyTxUsd, order.currencyTx);
        let total = priceCurrency(order.total, order.currency, order.currencyTxUsd, order.currencyTx);
        invoice['footer'] = footer(logger, totalHT, (totalHT * order.vatValue), total, currency, order.reason, order.vat, country, order.vatValide, user);
      
        // createInvoice(invoiceDetails);
      
        //Création du document PDF
        let pdfDoc = printer.createPdfKitDocument(invoice);
      
        var dir = 'files/invoice';
        if (clientAddress() == DOMAIN) {
          dir = "mapr/invoices"
        }
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        pdfDoc.pipe(fs.createWriteStream(path.join(dir, order.idCommande + '.pdf')));
        pdfDoc.end();
    };
}