import IUserDTO from './IUser';
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
            return await this.instance.patch(url, data);
        } catch (error) {
            console.error(error);
            return error.response;
        }
    }
}

interface ISchema {
    [key: string]: 'number' | 'string' | 'boolean' | 'undefined' | 'bigint' | 'object' | 'function';
}

export class Schema {
    private schema: ISchema;

    constructor(schema: ISchema) {
        this.schema = schema;
    }

    validate(obj: object): boolean {
        Object.entries(this.schema).forEach(([key, value]) => {
            if (obj[key] !== null && typeof obj[key] !== value) {
                return false;
            }
        });
        return true;
    }
}

export const getUserFullName = (user: IUserDTO): string => `${user.firstName} ${user.lastName}`;
