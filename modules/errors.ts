export class HTTPError extends Error {
    status: number;

    constructor(e: Error, statusCode: number) {
        super();

        // extend
        this.name = e.name;
        this.message = e.message;
        this.stack = e.stack;

        // status
        this.status = statusCode;
    }
}