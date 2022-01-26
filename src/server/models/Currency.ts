/// EXPORT CURRENCY IS A MERGED ENUM-NAMESPACE
/// WITH STATIC METHODS LOCATED IN THE NAMESPACE

/**
 * Represents ISO 4217 3-digit code for international currencies
 */
export enum Currency {
    USD, ILS, MXN, 
    UNKNOWN
}

export namespace Currency {
    export const Translation = {
        USD: Currency.USD,
        ILS: Currency.ILS,
        MXN: Currency.MXN,
    };

    export type Code = keyof typeof Translation;

    export function toString(c: Currency): string {
        return Currency[c];
    }

    export function from(str: string): Currency {
        return Translation[str] ?? Currency.UNKNOWN;
    }
}

export default Currency;
