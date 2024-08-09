export interface SecurityWrapper<T> {
    fields: Map<string, string>;
    actions: Array<string>;
    data: T;
}
