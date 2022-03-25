import { Class, classType } from "../types/class";
import { MergeTypes } from "../types/merge";
import { cache } from "./decorators";

export const mixin =
    <
        M extends Class[],
        C extends {
            [prop in keyof M]: classType<M[prop]>;
        },
        S extends MergeTypes<C>
    >(
        ...mixins: M
    ) =>
    <T extends Class>(target: T) => {
        mixins.forEach((mixin) => {
            // Static methods
            Reflect.ownKeys(mixin).forEach((name) =>
                Object.defineProperty(
                    target,
                    name,
                    Object.getOwnPropertyDescriptor(mixin, name) ||
                        Object.create(null)
                )
            );

            // Prototype methods
            Reflect.ownKeys(mixin.prototype).forEach((name) => {
                Object.defineProperty(
                    target.prototype,
                    name,
                    Object.getOwnPropertyDescriptor(mixin.prototype, name) ||
                        Object.create(null)
                );
            });
        });

        return target as (MergeTypes<M> & T) & Class<InstanceType<T> & S>;
    };

export const mergeClasses = cache(<M extends Class[]>(...classes: M) =>
    mixin(...classes)(class {})
);
