import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from './services/storageService';
import { OrdersService } from './services/orderService';
import {  ReactiveFormsModule } from '@angular/forms';
import { UserService } from './services/userService';
import { MPService } from './services/mpService';



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [
    StorageService,
    OrdersService,
    UserService,
    MPService
  ],
  exports : [
  ]
})
export class SharedModule { }
