export class Order {

    orderId: string;
    submissionDateTime: string;
    orderStatus: string;
    totalOrderAmount: string;
    invoice: any;
    details: any;

    constructor(orderId: string,
        submissionDateTime: string,
        orderStatus: string,
        totalOrderAmount: string,
        invoice: any,
        details: any) {
        this.orderId = orderId;
        this.submissionDateTime = submissionDateTime;
        this.orderStatus = orderStatus;
        this.totalOrderAmount = totalOrderAmount;
        this.invoice = invoice;
        this.details = details;

    }
}