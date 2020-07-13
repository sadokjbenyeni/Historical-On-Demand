export class Product {
    item: number;
    dataSet: string;
    instrumentID: number;
    productID: number;
    symbol: string;
    description: string;
    assetClass: string;
    exchange: string;
    mic: string;
    purchaseType: PurchaseType;
    engagementPeriod: number;
    dateFrom: string;
    dateTo: string;
    pricingTier: number;
    price: string;
    expirationDate: any;
    remainingDays: number;
    exchangeFee: number;
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
        subscription: number,
        engagementPeriod: number,
        dateFrom: string,
        dateTo: string,
        pricingTier: number,
        price: string,
        expirationDate: any,
        remainingDays: number,
        backfillFee: number,
        ongoingFee: number,
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
        this.purchaseType = subscription == 1 ? PurchaseType.subscription : PurchaseType.onetime;
        this.engagementPeriod = engagementPeriod;
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        this.pricingTier = pricingTier;
        this.price = price;
        this.expirationDate = expirationDate;
        this.remainingDays = remainingDays;
        this.exchangeFee = subscription == 1 ? ongoingFee : backfillFee;
        this.delivrables = delivrables;
    }
}
export enum PurchaseType {
    subscription = 'Recurrent delivery (Subscription)', onetime = 'One-Off delivery'
}
