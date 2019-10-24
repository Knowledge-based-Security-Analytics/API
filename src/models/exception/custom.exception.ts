export class CustomException extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, CustomException.prototype);
    }
}