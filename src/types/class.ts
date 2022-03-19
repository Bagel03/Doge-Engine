export type Class<T = any> = {
    new(...args: any[]): T
}

export type ConstructorFunction<T = any> = Function & Class<T>;
