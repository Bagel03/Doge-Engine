export type WithOnlyType<O, T> = {
    [P in keyof O as O[P] extends T ? P : never]: O[P];
};

export type KeysOfType<O, T> = {
    [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];
