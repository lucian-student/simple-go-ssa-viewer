

export enum HttpStatusCode {
    // 2xx Success
    OK = 200,
    Created = 201,
    Accepted = 202,
    NoContent = 204,

    // 4xx Client Errors
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    Conflict = 409,
    UnprocessableEntity = 422,
    TooManyRequests = 429,

    // 5xx Server Errors
    InternalServerError = 500,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
}

export class APIError extends Error {

    constructor(
        public readonly message: string,
        public readonly status: number
    ) {
        super(message)
    }

}