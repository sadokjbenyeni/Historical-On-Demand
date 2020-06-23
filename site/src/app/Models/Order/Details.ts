export class Details {
    commandId: string;
    idOrder: number;
    companyName: string;
    payment: string;
    firstname: string;
    lastname: string;
    job: string;
    country: string;
    currency: string;
    discount: number;
    currencyTx: number;
    currencyTxUsd: number;
    totalFees: number;
    totalHT: number;
    vat: string;
    totalVat: any;
    totalTTC: number;
    submissionDate: Date;
    state: string;
    invoice: string;
    token: string;
    
    constructor(commandId: string,
        idOrder: number,
        companyName: string,
        payment: string,
        firstname: string,
        lastname: string,
        job: string,
        country: string,
        currency: string,
        discount: number,
        currencyTx: number,
        currencyTxUsd: number,
        totalFees: number,
        totalHT: number,
        vat: string,
        totalVat: any,
        totalTTC: number,
        submissionDate: Date,
        state: string,
        invoice: string) {
        this.commandId = commandId;
        this.idOrder = idOrder;
        this.companyName = companyName;
        this.payment = payment;
        this.firstname = firstname;
        this.lastname = lastname;
        this.job = job;
        this.country = country;
        this.currency = currency;
        this.discount = discount;
        this.currencyTx = currencyTx;
        this.currencyTxUsd = currencyTxUsd;
        this.totalFees = totalFees;
        this.totalHT = totalHT;
        this.vat = vat;
        this.totalVat = totalVat;
        this.totalTTC = totalTTC;
        this.submissionDate = submissionDate;
        this.state = state;
        this.invoice = invoice;
    }
}