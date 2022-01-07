import IUserDTO from './IUser';
import axios, { AxiosResponse } from 'axios';

export class HTTPRequestFactory {
    async get<T>(url: string): Promise<AxiosResponse<T>> {
        try {
            return await axios.get<T>(url);
        } catch (error) {
            console.error(error);
        }
    }

    async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
        try {
            return await axios.post<T>(url, data);
        } catch (error) {
            console.error(error);
        }
    }

    async patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
        try {
            return await axios.patch<T>(url, data);
        } catch (error) {
            console.error(error);
        }
    }

    async delete<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
        try {
            return await axios.patch(url, data);
        } catch (error) {
            console.error(error);
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
