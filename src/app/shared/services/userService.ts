import { Injectable, EventEmitter } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, } from "@angular/common/http";
import { LocalStorageService } from "angular-2-local-storage";
import { Observable } from "rxjs";
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';



@Injectable({
    providedIn: 'root',
})
export class UserService {

    //Service constructure
    constructor(
        private httpClient: HttpClient,
        private storageService: LocalStorageService) {

    }

    public getToken(): any {
        return this.storageService.get('token');

    }   


    public postAddress(address:any): Observable<any> {


        //Get options
        const httpOptions = {
            headers: new HttpHeaders({
                'Authorization': 'Bearer ' + this.getToken(),
                'Accept': 'application/vnd.columnis.v2+json',

            }),
        };

        //Do request
        return this.httpClient
            .post(environment.addressesUrl, address , httpOptions)
            .pipe(
				//Map response
				map((response: any) => {

					return response;
				})
			);


    }


}