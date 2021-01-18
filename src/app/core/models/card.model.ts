
export class Card {
    public id :number;
    public cardIdMP :number;
    public cardType: string;
    public lastDigits: number;
    public firstSixDigits: number;

    constructor(id,cardIdMP,cardType,lastDigits,firstSixDigits) { 

        this.id = id;
        this.cardIdMP = cardIdMP;
        this.cardType = cardType;
        this.lastDigits = lastDigits;
        this.firstSixDigits = firstSixDigits;

    }


}
