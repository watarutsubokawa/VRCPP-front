export class Exchange {
    public begin: number;
    public end: number;
    public user: number; // userId in DB
    public session: number;
    public worldName: string;
    public exchangeId: number;
    constructor(data: {worldName: string, exchangeId: number, begin: number, end: number, user: number, session: number}) {
        this.begin = data.begin;
        this.end = data.end;
        this.user = data.user;
        this.session = data.session;
        this.exchangeId = data.exchangeId;
        this.worldName = data.worldName;
    }

    public getBeginDateTime() {
        return new Date(this.begin*1000);
    }

    public getEndDateTime() {
        return new Date(this.end*1000);
    }
}

export class User {
    public id: number;
    public vrc_internal_id: string;
    public name: string;
    constructor(data: {id: number, vrc_internal_id: string, name: string}) {
        this.id = data.id;
        this.vrc_internal_id = data.vrc_internal_id;
        this.name = data.name;
    }
}