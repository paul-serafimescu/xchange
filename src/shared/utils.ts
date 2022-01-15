import axios, { Axios, AxiosResponse } from 'axios';

export interface IRFOptions {
    authorizationToken: string;
}

export class HTTPRequestFactory {
    protected readonly options: IRFOptions;
    protected readonly instance: Axios;

    constructor(options?: IRFOptions) {
        this.instance = axios.create();
        if (options?.authorizationToken) {
            this.instance.defaults.headers.common['Authorization'] = `Bearer ${options.authorizationToken}`;
        }
    }

    async get<T>(url: string): Promise<AxiosResponse<T>> {
        try {
            return await this.instance.get<T>(url);
        } catch (error) {
            console.error(error);
            return error.response;
        }
    }

    async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
        try {
            return await this.instance.post<T>(url, data);
        } catch (error) {
            console.error(error);
            return error.response;
        }
    }

    async patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
        try {
            return await this.instance.patch<T>(url, data);
        } catch (error) {
            console.error(error);
            return error.response;
        }
    }

    async delete<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
        try {
            return await this.instance.delete(url, data);
        } catch (error) {
            console.error(error);
            return error.response;
        }
    }
}

export namespace Validation {
    export abstract class Verifiable {
        public abstract verify(other: any): boolean;
    }

    export class IEnum extends Verifiable {
        private values: string[];

        constructor(values: string[]) {
            super();
            this.values = values;
        }

        public verify(other: string): boolean {
            for (const symbol of this.values) {
                if (symbol === other) {
                    return true;
                }
            }
            return false;
        }
    }

    export type ISchemaPrimitives = 'number' | 'string' | 'boolean' | 'undefined' | 'bigint' | 'object' | 'function';

    export interface ISchema {
        [key: string]: Verifiable | & ISchemaPrimitives | 'any';
    };
    
    export class Schema {
        private schema: ISchema;
    
        constructor(schema: ISchema) {
            this.schema = schema;
        }
    
        validate(obj: object): boolean {
            var flag = true;
            Object.entries(this.schema).forEach(([key, value]) => {
                if (value === 'any') {
                    // do nothing
                } else if (value instanceof Verifiable) {
                    flag = value.verify(obj[key]);
                } else if (obj[key] !== null && typeof obj[key] !== value) {
                    flag = false;
                }
            });
            return flag;
        }
    }
};
