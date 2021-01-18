import { Component, Inject } from '@angular/core';
import { findSafariExecutable } from 'selenium-webdriver/safari';
import { StorageService } from './shared/services/storageService';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  displayCheckout: boolean = false;
  displayCart: boolean = true;
  displayCards: boolean = false;
  userEmail: string;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private storageService: StorageService
  ) {

    this.document.body.addEventListener('update', () => {

      this.displayCart = true;
      this.displayCheckout = false;
      this.displayCards = false;

    });


    this.document.body.addEventListener('openCards', () => {

      this.displayCart = false;
      this.displayCheckout = false;
      this.displayCards = true;

    });

  }


  ngOnInit(){
    
    this.displayCheckout = false;

  }

  onDisplayCheckout(result:boolean){
    this.displayCheckout = result;
    this.displayCards = false;
    
    if(!result){
      this.displayCart = true;
    }else{
      this.displayCart = false;
    }

  }

}



