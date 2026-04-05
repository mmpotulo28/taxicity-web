export interface RequestContext {
url: string;
init: RequestInit;
}

export interface ResponseContext {
url: string;
response: Response;
}

export type RequestInterceptor = (ctx: RequestContext) => Promise<RequestContext>;
export type ResponseInterceptor = (ctx: ResponseContext) => Promise<ResponseContext>;

export const identityRequestInterceptor: RequestInterceptor = async (ctx) => ctx;
export const identityResponseInterceptor: ResponseInterceptor = async (ctx) => ctx;
