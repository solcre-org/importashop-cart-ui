import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { StorageService } from 'src/app/shared/services/storageService';
import { Product } from 'src/app/core/models/product.model';
import { environment } from 'src/environments/environment.prod';
import { DOCUMENT } from '@angular/common';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  productsList: Product[];
  totalPrice: number = 0;
  finalPrice: number = 0;
  productsQuantities = [];
  productsWithNoStock: boolean = false;

  isLogged: boolean = false;


  picturesUrl: string;

  @Output() onDisplayCheckout: EventEmitter<boolean> = new EventEmitter<boolean>();


  constructor(
    @Inject(DOCUMENT) private document: Document,
    private storageService: StorageService
  ) {


    //IsLogged
    if (window['USER_DATA']) {
      this.isLogged = true;
    }

    this.productsList = [];
    this.productsQuantities = [];


    this.document.body.addEventListener('update', () => {

      //Getters
      this.productsList = [];

      //Get LS products
      this.storageService.getProducts().forEach((element, index) => {

        let p = new Product(element.id, element.name, element.code, element.pictureId, element.price, element.productUrl, element.quantity, element.stock)
        this.productsList.push(p)

        this.productsQuantities[element.id] = element.quantity;

      });

      //Get total price
      this.totalPrice = this.storageService.getTotalPrice();

    })


  }

  ngOnInit() {

    this.picturesUrl = environment.picturesUrl;


    //Getters

    //Get LS products
    this.storageService.getProducts().forEach((element, index) => {

      let p = new Product(element.id, element.name, element.code, element.pictureId, element.price, element.productUrl, element.quantity, element.stock)
      this.productsList.push(p)

      this.productsQuantities[element.id] = element.quantity;

    });

    //Get total price
    this.totalPrice = this.storageService.getTotalPrice();

  }


  //ACTIONS 

  removeProductFromCart(productId: number) {

    this.productsList.forEach((element, index) => {

      if (element.id == productId) {
        this.productsList.splice(index, 1);
      }

    });

    this.updateTotalPrice();

    this.updateLS();


  }


  //Increase value
  increaseValue(index: number) {

    this.productsQuantities[index]++;

    this.updateTotalPrice();
    this.updateLS();

  }

  //Reduce value
  reduceValue(index: number) {

    if (this.productsQuantities[index] > 1) {
      this.productsQuantities[index]--;

      this.updateTotalPrice();
      this.updateLS();

    }

  }

  //Check stock
  checkStock(stock: number, id: number): boolean {

    if (stock < this.productsQuantities[id]) {
      this.productsWithNoStock = true;
      return true;
    } else {
      this.productsWithNoStock = false;
      return false;
    }

  }

  checkStocks(productsList: Product[]): boolean {

    let count = 0;
    productsList.forEach(element => {

      if (element.stock < this.productsQuantities[element.id]) {
        count = count + 1;
      }

    });

    if (count > 0) {
      return true;
    } else {
      return false;
    }

  }


  //UPDATES
  updateTotalPrice() {

    //Calculate total price
    this.finalPrice = 0;

    this.productsList.forEach((element, index) => {

      this.finalPrice += element.price * this.productsQuantities[element.id];

    });

    this.totalPrice = this.finalPrice;

    //Set total price
    this.storageService.setTotalPrice(this.totalPrice);

  }


  updateLS() {

    //Update quantities
    this.productsList.forEach((element, index) => {

      element.quantity = this.productsQuantities[element.id];

    });

    //Set products to LS
    this.storageService.setProducts(this.productsList);
  }


  //Go to checkout
  goToCheckout() {
    this.onDisplayCheckout.emit(true);
    //this.storageService.setCheckoutStatus(true);

  }

  goToLogin() {

    let e: Event = new Event("loginRequested");
    this.document.body.dispatchEvent(e);

  }


}
