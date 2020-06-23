export interface OrderAmount {
    totalExchangeFees: number;
    totalHT: number;
    discount: number;
    totalVat: number;
    totalTTC: number;
    currency: string;
    vat: number;
}
