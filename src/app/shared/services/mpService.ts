import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

//Include var to load globally MP
declare var Mercadopago: any;

@Injectable({
	"providedIn": "root"
})
export class MPService {
	
	//Inject services
	constructor(
		private httpClient: HttpClient) { }

	public initSDK() {

		//Mercadopago.setPublishableKey("TEST-eb7f5741-5f7f-4a66-bb0d-06b0e1181369");
		Mercadopago.setPublishableKey("APP_USR-3f46eccc-ff1e-4c48-a4f8-ac4684aa0303");
	}

	public clearSession(){

		Mercadopago.clearSession();

	}

	/**
	 * Returns indicator types
	 */
	public fetchIdentificationTypes(): Observable<any[]> {
		let obs: Observable<any[]> = new Observable<any[]>(observer => {
			//Do request
			Mercadopago.getIdentificationTypes((status: number, response: any[]) => {
				//Check status
				if (status == 200) {
					//Success
					observer.next(response);
					observer.complete();
				} else {
					//Error
					observer.error(response);
				}
			})
		});
		return obs;
	}

		/**
	 * Returns payment methods types
	 */
	public fetchPaymentMethod(): Observable<any[]> {
		let obs: Observable<any[]> = new Observable<any[]>(observer => {

			//Do request
			Mercadopago.getAllPaymentMethods((status: number, response: any[]) => {

				//Check status
				if (status == 200) {
					//Success
					observer.next(response);
					observer.complete();
				} else {
					//Error
					observer.error(response);
				}
			})
		});
		return obs;
	}


	/***
	 * Returns payment method from BIN number
	 */
	public getPaymentMethod(bin: string): Observable<any> {
		let obs: Observable<any> = new Observable<any>(observer => {
			//Do request
			Mercadopago.getPaymentMethod({ "bin": bin }, (status: number, response: any[]) => {
				//Check status
				if (status == 200) {
					//Success
					observer.next(response[0]);
					observer.complete();
				} else {
					//Error
					observer.error(response[0]);
				}
			})
		});
		return obs;
	}

	/***
	 * Returns payment installments from BIN number
	 */
	public getInstallments(bin: string, amount: number): Observable<any> {
		let obs: Observable<any> = new Observable<any>(observer => {
			//Do request
			Mercadopago.getInstallments({ 
				"bin": bin,
				"amount": amount 
			}, (status: number, response: any[]) => {
				//Check status
				if (status == 200) {
					//Success
					observer.next(response[0]);
					observer.complete();
				} else {
					//Error
					observer.error(response[0]);
				}
			})
		});
		return obs;
	}


	/**
	 * Returns BIN number from card number
	 * @param cardNumber Card number
	 */
	public getBin(cardNumber: string): string {
		//Control number
		if (!cardNumber) {
			return '';
		}
		return cardNumber.replace(/[ .-]/g, '').slice(0, 6);
	}

	
	/**
	 * Returns a MP card token
	 * @param card The card object
	 */
	public createCardToken(card: any): Observable<any> {
		let obs: Observable<any> = new Observable<any>(observer => {
			//Do request
			Mercadopago.createToken(card, (status: number, response: any) => {
				//Check status
				if (status == 200) {
					//Success
					observer.next(response);
					observer.complete();
				} else {
					//Error
					observer.error(response);
				}
			})
		});
		return obs;
	}
}