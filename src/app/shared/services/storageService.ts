import { Injectable, EventEmitter } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, } from "@angular/common/http";
import { LocalStorageService } from "angular-2-local-storage";
import { Observable } from "rxjs";
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Product } from 'src/app/core/models/product.model';
import { element } from 'protractor';



@Injectable({
    providedIn: 'root',
})
export class StorageService {




    //Service constructure
    constructor(
        private httpClient: HttpClient,
        private storageService: LocalStorageService) {

    }


    public getProducts(): any {

        let ls = this.storageService.get(environment.cartLS);

        if (ls) {
            let products = ls[0].products;
            return products;
        } else {
            return [];
        }
    }
    public getProductsCount(): any {

        let ls = this.storageService.get(environment.cartLS);

        let quantity = 0;
        if (ls) {
            ls[0].products.forEach(element => {
               quantity =  quantity + element.quantity ;
            });
            
            return quantity;
        } else {
            return [];
        }
    }

    public getTotalPrice(): number {

        if (this.storageService.get(environment.cartLS)) {
            let ls = this.storageService.get(environment.cartLS)[0].totalPrice;

            return ls;

        }else{
            return 0;
        }
    }

    public getProductStock(productId: number): any {

        let ls = this.storageService.get(environment.cartLS);

        if (ls) {
            let products = ls[0].products;

            for (let index = 0; index < products.length; index++) {
                const element = products[index];

                if(element.id == productId){
                    return element;
                }

            }

        } else {
            return [];
        }
    }
    public setProductStock(productId: number, stock:number): any {

        let ls = this.storageService.get(environment.cartLS);

        let productsList:Product[] = [];

        if (ls) {
            let products = ls[0].products;

            for (let index = 0; index < products.length; index++) {
                const element = products[index];

                if(element.id == productId){
                    element.stock = stock;
                }


                productsList.push(element);
            }

            ls[0].products = productsList;

            this.storageService.set(environment.cartLS, ls);


        } else {
            return [];
        }
    }


    public setProducts(productsList: any[]): any {

        let currentLS = this.storageService.get(environment.cartLS);

        if (currentLS) {
            currentLS[0].products = productsList;



            this.storageService.set(environment.cartLS, currentLS);
        }

    }

    public setTotalPrice(totalPrice: number): any {

        let currentLS = this.storageService.get(environment.cartLS);

        if (currentLS) {
            currentLS[0].totalPrice = totalPrice;
            this.storageService.set(environment.cartLS, currentLS);
        }

    }

    public getShipping(): any {

        return this.storageService.get('shippingSelected');

    }
    public setShipping(result: any): any {

        this.storageService.set('shippingSelected', result);

    }

    public getAgency(): any {

        return this.storageService.get('agencySelected');

    }
    public setAgency(result: any): any {

        this.storageService.set('agencySelected', result);

    }

    public getAddress(): any {

        return this.storageService.get('addressSelected');

    }
    public setAddress(result: any): any {

        this.storageService.set('addressSelected', result);

    }

    public getCard(): any {

        return this.storageService.get('cardSelected');

    }
    public setCard(result: any): any {

        this.storageService.set('cardSelected', result);

    }

    public getCartActive(): any {

        return this.storageService.get('cartActive');

    }
    public setCartActive(result: any): any {

        this.storageService.set('cartActive', result);

    }


    public setAllEmpty():any{
        this.setAddress('me');
        this.setCard('');
        this.setProducts([]);
        this.setShipping({
            "id": "3",
            "price": 0
          });
        this.setTotalPrice(0);
        

    }








}