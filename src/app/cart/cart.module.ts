import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import {  ReactiveFormsModule } from '@angular/forms';
import { CardsComponent } from './cards/cards.component';
import { PrettyNumberPipe } from './pipes/pretty-number.pipe';




@NgModule({
  declarations: [
    CartComponent, 
    CheckoutComponent, 
    CardsComponent,
    PrettyNumberPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    CartComponent,
    CheckoutComponent,
    CardsComponent,
    PrettyNumberPipe
  ]
})
export class CartModule { }
