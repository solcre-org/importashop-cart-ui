import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocalStorageModule } from 'angular-2-local-storage';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { CartModule } from './cart/cart.module';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    LocalStorageModule.forRoot({
      prefix: 'importashop',
      storageType: 'localStorage'
    }),
    HttpClientModule,
    BrowserModule,
    CartModule,
    SharedModule,
    CoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
