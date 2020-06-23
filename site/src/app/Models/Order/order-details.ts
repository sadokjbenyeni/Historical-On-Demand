import { Product } from "./product";
import { Details } from "./Details";

export class OrderDetails {
    details: Details;
    products: Array<Product>;

    constructor(details: Details, products:Array<Product>){
        this.details = details;
        this.products = products;
    }
}
