import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Card } from 'src/app/core/models/card.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StorageService } from 'src/app/shared/services/storageService';
import { OrdersService } from 'src/app/shared/services/orderService';
import { MPService } from 'src/app/shared/services/mpService';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {

  loading: boolean = false;
  cardMessage: string;
  cardSelected: number;
  cardInfo: Card;

  //Cards
  cards: Card[];
  cardPaymentMethod: string;
  identificationTypes: any[];
  paymentMethods: any[];

  //Form
  cardForm: FormGroup;
  newCardForm: FormGroup;

  addMode: boolean = false;

  @Input() editMode: boolean;
  @Input() retryPay: boolean;
  @Output() onChangeTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSendCard: EventEmitter<any> = new EventEmitter<any>();



  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
    private ordersService: OrdersService,
    private mercadoPagoService: MPService


  ) {

    //Get LS card
    if (this.storageService.getCard() != null) {
      this.cardSelected = this.storageService.getCard().id;
      this.cardInfo = this.storageService.getCard();
    }

    //Cards

    //cardForm controls
    this.cardForm = this.fb.group({
      card: this.fb.control(this.cardSelected, Validators.required),
    });


    this.cards = [];
    this.cardPaymentMethod = '';


    //newCardForm controls
    this.newCardForm = this.fb.group({
      "email": this.fb.control(window['USER_DATA'].me.usuario, [Validators.required]),
      "cardNumber": this.fb.control('', [Validators.required]),
      "cardExpirationMonth": this.fb.control('', [Validators.required]),
      "cardExpirationYear": this.fb.control('', [Validators.required]),
      "cardholderName": this.fb.control('', [Validators.required]),
      "docType": this.fb.control('', [Validators.required]),
      "docNumber": this.fb.control('', [Validators.required]),
      "securityCode": this.fb.control('', [Validators.required]),
    });



  }

  ngOnInit() {

    this.initMP();
    // this.fetchUserCards();

  }

  //Emit methods

  changeAddMode(val: boolean) {
    this.addMode = val;
  }

  changeTab(val: number) {

    this.onChangeTab.emit(val);

  }
  sendCard(val: any) {
    this.onSendCard.emit(val);

  }


  //Custom events
  onAddCard() {
    //Check is valid
    if (this.newCardForm.valid && this.cardPaymentMethod) {
      //Set loading on
      this.loading = true;

      this.mercadoPagoService.clearSession();

      //Create MP card token
      this.mercadoPagoService.createCardToken(this.newCardForm.value).subscribe(
        (response: any) => {

          //Create columnis card object
          this.ordersService.createCard(response.id, this.cardPaymentMethod).subscribe(
            (card: any) => {

              let newCard = new Card(card.id, card.cardId, card.cardType, card.lastDigits, card.firstSixDigits);

              //Push to cards array
              this.cards.push(newCard);

              //Stop loading
              this.loading = false;

              this.setCard(newCard);

              this.cardForm.patchValue({
                "card": this.cardSelected
              });


              this.addMode = false;

              this.newCardForm.reset();

              this.newCardForm.patchValue({
                "email": window['USER_DATA'].me.usuario
              });

            },

            (err: any) => {

              if (err.error.status == 422) {
                this.cardMessage = "No se puede agregar esta tarjeta. Intente con otra."
              }

              //Stop loading
              this.loading = false;
            }
          );
        },
        (err: any) => {
          //Stop loading
          this.loading = false;
          if (err.cause[0].code == "E301") {
            this.cardMessage = "Tarjeta inválida"
          }
          else if (err.cause[0].code == "E302") {
            this.cardMessage = "Código de seguridad inválido"
          }
          else if (err.cause[0].code == "324") {
            this.cardMessage = "Documento inválido"
          }
          else if (err.cause[0].code == "325" || err.cause[0].code == "326") {
            this.cardMessage = "Fecha de expiración inválida"
          }

        }
      );
    } else {

    }
  }

  onCardNumberChange() {
    //calculate bin
    const bin: string = this.mercadoPagoService.getBin(this.newCardForm.value.cardNumber);

    //Check bin
    if (bin) {
      //Find payment method
      this.mercadoPagoService.getPaymentMethod(bin).subscribe(
        (response: any) => {
          //Load payment method
          this.cardPaymentMethod = response.id;
        }
      )
    }
  }


  setCard(card: Card) {

    this.cardSelected = card.id;
    this.cardInfo = card;
    this.storageService.setCard(card);

  }

  deleteCard(id: number, index: number): any {

    this.loading = true;
    this.storageService.setCard("");

    this.ordersService.deleteCard(id).subscribe(

      (response: any) => {

        this.cards.splice(index, 1);

        this.ordersService.fetchCards().subscribe(
          (cards: Card[]) => {

            //Load cards
            this.cards = cards;

            this.loading = false;

          },
          (error: any) => {
            this.loading = false;
          }

        );

      },
      (error: any) => {
      }

    );

  }


  //Private methods

  private initMP() {

    //Init SDK
    this.mercadoPagoService.initSDK();

    this.fetchUserCards();

    //Load MP identification methods
    this.mercadoPagoService.fetchIdentificationTypes().subscribe((identificationTypes: any[]) => {
      this.identificationTypes = identificationTypes;

      //Suggest form, first type
      if (identificationTypes && identificationTypes.length) {
        this.newCardForm.patchValue({
          "docType": identificationTypes[0].id
        });
      }
    });

    //Inital trigger for testing
    //The card number test value is valid
    this.onCardNumberChange();


  }

  private fetchUserCards() {
    //Start loading
    this.loading = true;

    //Clear cards
    this.cards = [];

    //Request
    this.ordersService.fetchCards().subscribe(
      (cards: Card[]) => {

        //Load cards
        this.cards = cards;

        //Fetch paymet methods
        this.mercadoPagoService.fetchPaymentMethod().subscribe((response: any[]) => {
          //Load filter credit card and debit cards
          this.paymentMethods = response.filter((pm: any) => {
            return pm.payment_type_id != 'credit_card' && pm.payment_type_id != 'debit_card';
          });
        })

        this.loading = false;
      },
      (error: any) => {
        //Stop loading
        this.loading = false;
      }
    );
  }


}
