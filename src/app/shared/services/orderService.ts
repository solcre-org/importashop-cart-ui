import { HttpClient, HttpErrorResponse, HttpHeaders, } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from 'src/environments/environment';
import { StorageService } from './storageService';
import { Injectable, EventEmitter } from "@angular/core";
import { map } from 'rxjs/operators';
import { UserService } from './userService';
import { Card } from 'src/app/core/models/card.model';


@Injectable({
    providedIn: 'root',
})
export class OrdersService {

    constructor(
        private httpClient: HttpClient,
        private userService: UserService
    ) { }

		

	public createCard(mpCardToken: string, mpPaymentMethod: string): Observable<any> {

		//Post options
		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization': 'Bearer ' + this.userService.getToken(),
				'Accept': 'application/vnd.ecommerce.v2+json'
			})
		}

		//Url
		const url: string = environment.cardsUrl;

		//Do request
		return this.httpClient
			.post(url, {
				"token": mpCardToken,
				"paymentMethodType": mpPaymentMethod
			}, httpOptions);
	}


	public deleteCard(cardId:number): Observable<any> {

		//Post options
		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization': 'Bearer ' + this.userService.getToken(),
				'Accept': 'application/vnd.ecommerce.v2+json'
			})
		}

		//Url
		const url: string = environment.cardsUrl + '/' + cardId;

		//Do request
		return this.httpClient
			.delete(url, httpOptions)
			.pipe(
				//Map response
				map((response: any) => {
					//Return api response model
					return response;
				})
			);
	}


	public fetchCards(): Observable<any> {
		//Post options
		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization': 'Bearer ' + this.userService.getToken(),
				'Accept': 'application/vnd.ecommerce.v2+json'
			})
		}

		//Url
		const url: string = environment.cardsUrl;

		//Do request
		return this.httpClient.get(url, httpOptions).pipe(
			map((response: any) => {
				
				let cards: Card[]= [];

				response._embedded.users_cards.forEach(element => {
					let card : Card = new Card(element.id,element.cardId,element.cardType,element.lastDigits,element.firstSixDigits)
					cards.push(card);
				});	

				//check embedded
				return cards;
			})
		);
    }
    

    public postOrder(order): Observable<any> {

        //Get options
        const httpOptions = {
            headers: new HttpHeaders({
                'Authorization': 'Bearer ' + this.userService.getToken(),
                'Accept': 'application/vnd.ecommerce.v2+json',

            }),
        };

        //Do request
        return this.httpClient
            .post(environment.ordersUrl, order , httpOptions)
            .pipe(
				//Map response
				map((response: any) => {

					return response;
				})
			);


	}
	
    public patchOrder(orderId,order,secretOrder): Observable<any> {

        //Get options
        const httpOptions = {
            headers: new HttpHeaders({
                'Authorization': 'Bearer ' + this.userService.getToken(),
                'Accept': 'application/vnd.ecommerce.v2+json',

            }),
		};
		
		let patchOrder = {

			"card": {
				"token": order.card.token
			},
			"paymentMethodType": order.paymentMethodType,
			"payment_gateway": order.payment_gateway,
			"secret_code": secretOrder
		}
		

        //Do request
        return this.httpClient
            .patch(environment.ordersUrl + '/' + orderId , patchOrder , httpOptions)
            .pipe(
				//Map response
				map((response: any) => {

					return response;
				})
			);


    }



}