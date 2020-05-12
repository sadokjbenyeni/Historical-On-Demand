import { Data } from "./Data";
import { Details } from "./Details";

export class OrderDetails {
    details: Details;
    products: Array<Data>;

    constructor(details: Details, products:Array<Data>){
        this.details = details;
        this.products = products;
    }
}
