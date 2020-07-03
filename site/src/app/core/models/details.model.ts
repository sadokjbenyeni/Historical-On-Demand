import { OrderAmount } from "../../modules/order/models/order-amount.model";
import { OrderInformation } from "../../modules/order/models/order-information.model";
import { ClientInformation } from "../../modules/client/models/client-information.model";

export interface Details {
    commandId: string;
    currencyTx: number;
    currencyTxUsd: number;
    token: string;
    
    orderAmount: OrderAmount;
    orderInformation: OrderInformation;
    clientInformation: ClientInformation;
}
