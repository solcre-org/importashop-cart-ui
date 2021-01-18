import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { OrdersService } from 'src/app/shared/services/orderService';
import { StorageService } from 'src/app/shared/services/storageService';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UserService } from 'src/app/shared/services/userService';
import { MPService } from 'src/app/shared/services/mpService';
import { DOCUMENT } from '@angular/common';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  //UI
  loading: boolean = false;
  activeTab: number;
  errorMessage: string;
  addressMessage: string;
  paymentError: boolean;
  retryPay: boolean = false;
  retryOrderId: number;
  retryOrderSecretCode: any;



  @Output() onDisplayCheckout: EventEmitter<boolean> = new EventEmitter<boolean>();

  //Windows data
  userData: any;
  addressName: any;
  newAddressName: any;
  shippingName: any;
  addressesData: any;
  agenciesData: any;
  agenciesFilteredData: any;
  shippingData: any;
  paymentData: any;

  //Order
  order: any;

  //Shipping
  shippingSelected: any;

  //Address
  addressSelected: string;

  //Payment
  cardSelected: number;
  cardInfo: any;
  paymentMethods: any[];
  installments: any[];


  //Form
  shippingForm: FormGroup;
  agencyForm: FormGroup;
  addressForm: FormGroup;
  newAddressForm: FormGroup;
  payForm: FormGroup;


  //Resume
  totalPrice: number;
  itemsCount: number;


  constructor(
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder,
    private storageService: StorageService,
    private ordersService: OrdersService,
    private userService: UserService,
    private mercadoPagoService: MPService
  ) {

    //Initializes
    this.agenciesData = [];
    this.agenciesFilteredData = [];
    this.addressesData = [];
    this.userData = [];
    this.shippingData = [];
    this.paymentData = [];

    this.shippingSelected = {
      "id": "",
      "price": ""
    };


    //GET STATES 

    //Get LS Shipping
    if (this.storageService.getShipping() != null) {
      this.shippingSelected.id = this.storageService.getShipping().id;
      this.shippingSelected.price = this.storageService.getShipping().price;
    } else {
      this.shippingSelected.id = "3";
      this.shippingSelected.price = 0;
      this.storageService.setShipping(this.shippingSelected);
    }

    //Get LS Address
    if (this.storageService.getAddress() != null) {
      this.addressSelected = this.storageService.getAddress();
    } else {
      this.addressSelected = "me";
      this.storageService.setAddress(this.addressSelected);
    }

    //Get LS card
    if (this.storageService.getCard() != null) {
      this.cardSelected = this.storageService.getCard().id;
      this.cardInfo = this.storageService.getCard();
    }


    //agencyForm controls
    this.agencyForm = this.fb.group({
      department: this.fb.control('', Validators.required),
    });

    //shipmentForm controls
    this.shippingForm = this.fb.group({
      shipping: this.fb.control(this.shippingSelected.id, Validators.required),
    });

    //addressForm controls
    this.addressForm = this.fb.group({
      address: this.fb.control(this.addressSelected, Validators.required),
    });


    //newaddressForm controls
    this.newAddressForm = this.fb.group({
      address: this.fb.control('', Validators.required),
      zipCode: this.fb.control('', Validators.required),
      countryIso: this.fb.control('', Validators.required),
      state: this.fb.control(''),
      city: this.fb.control('', Validators.required),
      addressDetails: this.fb.control(''),
      isDefault: this.fb.control(''),
      email: this.fb.control(''),
      user: this.fb.control('')
    });


    //payForm controls
    this.payForm = this.fb.group({
      "card": this.fb.control('', [Validators.required]),
      "paymentMethodType": this.fb.control('', [Validators.required]),
      "installments": this.fb.control('1', [Validators.required]),
      "issuer": this.fb.control('', [Validators.required]),
      "cvv": this.fb.control('', [Validators.required])
    });



    //Resume
    this.totalPrice = this.storageService.getTotalPrice();
    this.itemsCount = this.storageService.getProductsCount();


  }


  ngOnInit() {

    this.userData = window['USER_DATA'].me;
    this.addressName = window['USER_DATA'].addresses;
    this.shippingName = window['SHIPPING_DATA'];

    this.loadDataFromWindows();
    this.loadFormDefaults();

  

    this.activeTab = 1

    this.order = {
      "items": [],

      "name": this.userData.nombre,
      "last_name": this.userData.apellido,
      "phone": this.userData.telefono,
      "email": this.userData.usuario,
      "document": this.userData.documento,
      "company_name": this.userData.empresa,
      "company_rut": this.userData.rut,
      "user_id": this.userData.id,

      "address": "",
      "state": "",
      "zipcode": "",
      "countryIso": "",
      "city": "",

      "extra_data": {
        "paymentMethod": 1
      },
      "payment_gateway": 1, //Hardcode 1 because it only support MercadoPago,
      "total": "",
      "paymentMethodType": "",

    }

  }



  //ROUTING 

  goToTab(num: number) {

    this.activeTab = num;

  }

  onChangeTab(result: number) {

    this.goToTab(result);

  }

  backToCart() {

    this.onDisplayCheckout.emit(false);

  }


  //SHIPPING

  setShipping(price: number) {

    this.shippingSelected.id = this.shippingForm.get('shipping').value;
    this.shippingSelected.price = price;

    this.storageService.setShipping(this.shippingSelected);

  }

  //ADDRESSES

  setAddress() {

    this.addressSelected = this.addressForm.get('address').value;
    this.storageService.setAddress(this.addressForm.get('address').value);

  }


  sendAddress() {

    this.loading = true;
    if (this.newAddressForm.valid) {

      this.newAddressForm.get('email').setValue(this.userData.usuario);
      this.newAddressForm.get('user').setValue(this.userData.usuario);

      let addressJSON = {

        "address": {
          "address": this.newAddressForm.get('address').value,
          "zipCode": this.newAddressForm.get('zipCode').value,
          "countryIso": this.newAddressForm.get('countryIso').value,
          "state": this.newAddressForm.get('state').value,
          "city": this.newAddressForm.get('city').value,
          "addressDetails": this.newAddressForm.get('addressDetails').value,
        },
        "isDefault": this.newAddressForm.get('isDefault').value,
        "email": this.newAddressForm.get('email').value,
        "user": this.newAddressForm.get('user').value,

      }

      this.userService.postAddress(addressJSON).subscribe(

        (data: any) => {
          this.loading = false;

          this.goToTab(2);

          data._embedded.address.id = data._embedded.address.id.toString();

          //Push to addressdata
          this.addressesData.push(data._embedded.address);

          //Select pushed address
          this.addressForm.get('address').setValue(data._embedded.address.id);
          this.addressSelected = this.addressForm.get('address').value;
          this.storageService.setAddress(this.addressForm.get('address').value);
          this.newAddressName = data._embedded.address.address;

          //Reset new address form
          this.newAddressForm.reset();
          this.loadFormDefaults();

        },
        (err: HttpErrorResponse) => {
          this.loading = false;

          this.addressMessage = err.error.detail;

        }
      )

    } else {
    }


  }

  //AGENCIES
  selectDepto(department: string) {

    this.agenciesFilteredData = [];

    this.agenciesData.forEach(element => {
      if (element.state == department) {
        this.agenciesFilteredData.push(element);
      }
    });


  }



  //CARD

  onSendCard(result: any) {

    if (this.shippingSelected.id == 2) {
      this.addressName = window['AGENCIES_DATA'];
    } else {
      this.addressName = window['USER_DATA'].addresses;

    }

    if (result) {

      this.cardSelected = this.storageService.getCard().id;
      this.cardInfo = this.storageService.getCard();


      //installments

      this.installments = [];

      //Price
      let price = this.shippingSelected.price + this.totalPrice;

      //If is card
      if (result.payment_type_id !== "ticket") {

        this.payForm.patchValue({
          "card": this.cardSelected,
          "paymentMethodType": "card",
          "installments": "",
          "issuer": "",
        });


        //Fetch installments
        this.mercadoPagoService.getInstallments(result.firstSixDigits, price).subscribe(
          (installmentsResponse: any) => {

            //Load installments
            this.installments = installmentsResponse.payer_costs;

            //Suggest installemt
            if (this.installments && this.installments.length) {
              this.payForm.patchValue({
                "installments": this.installments[this.installments.length - 1].installments
              });
            }

            //Load issuer id to payForm
            if (installmentsResponse.issuer && installmentsResponse.issuer.id) {
              this.payForm.patchValue({
                "issuer": installmentsResponse.issuer.id
              });
            }
          }
        )

        this.goToTab(7);

      } else {

        let values: any = {
          "card": "-",
          "paymentMethodType": this.cardSelected,
          "installments": "-",
          "issuer": "-",
          "cvv": "-"
        }

        this.payForm.patchValue(values);

        this.goToTab(4);


      }


    }
  }



  //Send order

  sendOrder() {

    this.loading = true;

    //Set address

    if (this.shippingSelected.id == 1) {
      let addressObj;
      this.addressesData.forEach(element => {
        if (element.id == this.addressSelected) {
          addressObj = element;
        }
      });

      this.order.address = addressObj.address;
      this.order.state = addressObj.state;
      this.order.zipcode = addressObj.zipcode;
      this.order.countryIso = addressObj.countryIso;
      this.order.city = addressObj.city;

    } else if (this.shippingSelected.id == 2) {
      let addressObj;
      this.agenciesData.forEach(element => {
        if (element.id == this.addressSelected) {
          addressObj = element;
        }
      });

      this.order.address = addressObj.address;
      this.order.state = addressObj.state;

    }

    //Add items of cart
    let auxItem: any = {};
    let needAddShipping: boolean = true;
    let products = [];


    this.storageService.getProducts().forEach((element: any) => {


      //Formated structure
      auxItem = {
        product: element.id,
        quantity: element.quantity
      };

      //Is shipping product??
      if (element.id == 1 || element.id == 2 || element.id == 3) {

        //Update price
        auxItem.price = this.shippingSelected.price;
        needAddShipping = false;

      }

      //Add to parsed array
      products.push(auxItem);

    });

    //Must add shiping?
    if (needAddShipping) {
      products.push({
        product: this.shippingSelected.id,
        quantity: 1,
        price: this.shippingSelected.price
      });
    }

    this.order.items = products;

    //Add shipping price to total
    let finalPrice = this.shippingSelected.price + this.storageService.getTotalPrice();
    this.order.total = finalPrice;


    //Payment

    //Get selected card
    let payObj: any = this.payForm.value;
    let card: any = this.cardInfo;
    let paymentMethodType: string = payObj.paymentMethodType;

    //Check pay with card???
    if (card.cardType) {

      this.mercadoPagoService.clearSession();

      //Get cardToken + cvv token
      this.mercadoPagoService.createCardToken({
        "cardId": this.cardInfo.cardIdMP,
        "securityCode": payObj.cvv
      }).subscribe(
        (response: any) => {
          //Check payment token
          if (response.id) {
            //Proceed with payment
            this.payOrder(card.cardType, response.id, payObj.issuer, payObj.installments);
          }
        },
        (error: any) => {

          this.goToTab(3);
          this.paymentError = true;

          //Stop loading
          this.loading = false;
        });
      return;
    }

    //Pay with abitab
    this.payOrder(paymentMethodType);


  }



  //Send order
  private payOrder(paymentMethodType: string, cardToken?: string, cardIssuer?: string, cardInstallments?: number) {

    this.order.paymentMethodType = paymentMethodType;

    //Check card values
    if (cardToken && cardIssuer && cardInstallments) {
      this.order.card = {
        "token": cardToken,
        "issuer_id": cardIssuer,
        "installments": cardInstallments
      };
    }

    if (!this.retryPay) {

      this.ordersService.postOrder(this.order).subscribe(

        (data: any) => {

          this.dataOrder(data, cardToken);

        },
        (err: any) => {

          this.errorOrder(err);

        }
      );

    } else {

      this.ordersService.patchOrder(this.retryOrderId, this.order, this.retryOrderSecretCode).subscribe(

        (data: any) => {

          this.dataOrder(data, cardToken);

        },
        (err: any) => {

          this.errorOrder(err);

        }
      );

    }


  }


  //Private methods


  private dataOrder(data, cardToken) {

    this.loading = false;

    this.payForm.reset();

    //Pago completo
    if (data.paid) {
      this.backToCart();
      this.storageService.setAllEmpty();

      let e: Event = new Event("successOrder");
      this.document.body.dispatchEvent(e);
      this.retryPay = false;
    } else {

      //Con tarjeta, fallo = Reintentar pago
      if (cardToken) {

        this.goToTab(3);
        this.paymentError = true;
        this.retryOrderId = data.id;
        this.retryOrderSecretCode = data.secretCode;
        this.retryPay = true;

      }
      //Sin tarjeta, pendiente
      else {
        this.backToCart();
        this.storageService.setAllEmpty();
        this.retryPay = false;

        let ep: Event = new Event("pendingOrder");
        this.document.body.dispatchEvent(ep);
      }

    }
  }

  private errorOrder(err) {

    this.loading = false;

    this.errorMessage = err.error.detail;


    if (err.error.detail == "Sin stock") {

      this.backToCart();

      err.error.outOfStockProductsAndVersions.forEach(elementOutOfStock => {

        this.storageService.setProductStock(elementOutOfStock.productId, elementOutOfStock.stock);
      });

    } else {

      this.goToTab(3);
      this.paymentError = true;

    }

  }


  private loadDataFromWindows() {

    //Iterate 
    let addresses: any = window['USER_DATA'].addresses;

    //Iterate with for the addresses
    for (let i in addresses) {
      addresses[i].id = i;
      this.addressesData.push(addresses[i]);
    }

    //Iterate 
    let agencies: any = window['AGENCIES_DATA'];

    //Iterate with for the addresses
    for (let i in agencies) {
      agencies[i].id = i;
      this.agenciesData.push(agencies[i]);
    }

    //Iterate 
    let shippings: any = window['SHIPPING_DATA'];

    //Iterate with for the addresses
    for (let i in shippings) {
      shippings[i].id = i;
      this.shippingData.push(shippings[i]);
    }

    //Iterate 
    let payments: any = window['PAYMENT_DATA'];

    //Iterate with for the addresses
    for (let i in payments) {
      payments[i].id = i;
      this.paymentData.push(payments[i]);
    }


  }



  private loadFormDefaults() {

    this.newAddressForm.patchValue({
      countryIso: 'UY',
      state: 'Montevideo',
    })

    this.agencyForm.patchValue({
      department: ' '
    })

  }

}
