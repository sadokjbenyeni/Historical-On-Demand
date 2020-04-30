export class OrderData {
    item: number;
    dataSet: string;
    instrumentID: number;
    productID: number;
    symbol: string;
    description: string;
    assetClass: string;
    exchange: string;
    mic: string;
    purchaseType: string;
    engagementPeriod: number;
    dateFrom: string;
    dateTo: string;
    pricingTier: number;
    price: string;
    expirationDate: any;
    remainingDays: number;
    delivrables: any;


    constructor(
        item: number,
        dataSet: string,
        instrumentID: number,
        productID: number,
        symbol: string,
        description: string,
        assetClass: string,
        exchange: string,
        mic: string,
        purchaseType: string,
        engagementPeriod: number,
        dateFrom: string,
        dateTo: string,
        pricingTier: number,
        price: string,
        expirationDate: any,
        remainingDays: number,
        delivrables: any) {
        this.item = item;
        this.dataSet = dataSet;
        this.instrumentID = instrumentID;
        this.productID = productID;
        this.symbol = symbol;
        this.description = description;
        this.assetClass = assetClass;
        this.exchange = exchange;
        this.mic = mic;
        this.purchaseType = purchaseType;
        this.engagementPeriod = engagementPeriod;
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        this.pricingTier = pricingTier;
        this.price = price;
        this.expirationDate = expirationDate;
        this.remainingDays = remainingDays;
        this.delivrables = delivrables;
    }
}