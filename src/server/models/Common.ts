export interface Serializable<T> {
    toJSON: () => T;
}
