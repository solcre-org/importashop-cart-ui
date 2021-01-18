
export class Product {
    public id: number;
    public name: string;
    public code: string;
    public pictureId: string;
    public price: number;
    public productUrl: string;
    public quantity: number;
    public stock: number;

    constructor(id,name,code,pictureId,price,productUrl,quantity,stock) { 

        this.id = id;
        this.name = name;
        this.code = code;
        this.pictureId = pictureId;
        this.price = price;
        this.productUrl = productUrl;
        this.quantity = quantity;
        this.stock = stock;

    }


}
