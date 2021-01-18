import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'prettyNumber'
})
export class PrettyNumberPipe implements PipeTransform {

	transform(value: number, args?: any): any {
		let currency: string = '';
		let digits: number = 2;

		//Check args
		if(args){
			//Digits
			if(args.digits != undefined){
				digits = args.digits;
			}

			//currency
			if(args.currency != undefined){
				currency = args.currency + " ";
			}
		}
		
		return currency + (value ? value : 0).toLocaleString('es-uy', {
			"minimumFractionDigits": digits,
			"maximumFractionDigits": digits
		})
	}

}
