"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Exchange = void 0;
class Exchange {
    constructor(data) {
        this.begin = data.begin;
        this.end = data.end;
        this.user = data.user;
        this.session = data.session;
        this.exchangeId = data.exchangeId;
        this.worldName = data.worldName;
    }
    getBeginDateTime() {
        return new Date(this.begin * 1000);
    }
    getEndDateTime() {
        return new Date(this.end * 1000);
    }
}
exports.Exchange = Exchange;
class User {
    constructor(data) {
        this.id = data.id;
        this.vrc_internal_id = data.vrc_internal_id;
        this.name = data.name;
    }
}
exports.User = User;
