"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPError = void 0;
class HTTPError extends Error {
    constructor(e, statusCode) {
        super();
        // extend
        this.name = e.name;
        this.message = e.message;
        this.stack = e.stack;
        // status
        this.status = statusCode;
    }
}
exports.HTTPError = HTTPError;
