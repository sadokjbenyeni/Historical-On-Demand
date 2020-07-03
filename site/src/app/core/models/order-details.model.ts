import { Details } from "./details.model";
import { Product } from "./product.model";

export class OrderDetails {
    details: Details;
    products: Array<Product>;

    constructor(details: Details, products: Array<Product>) {
        this.details = details;
        this.products = products;
    }
}