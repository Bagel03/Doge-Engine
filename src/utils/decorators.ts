import { Entity } from "../core/entity";
import { protectedComponentSymbol, nameSymbol } from "../config/symbols";
import { GameObject } from "../core/game_object";
import { System } from "../core/system";
import { Class } from "../types/class";

export const name = (name: string) => (target: any) => {
    target[nameSymbol] = name;
    return target;
};

export const protectedComponent = (target: any) => {
    target[protectedComponentSymbol] = true;
    return target;
};

export const defaultComponent =
    (...args: any[]) =>
    (target: any) => {
        GameObject.defaultComponents.push({ component: target, args });
        return target;
    };

export const defaultSystem = <T extends Entity = Entity>(
    target: Class<System<T>>
) => {
    GameObject.defaultSystems.push(target);
    return target;
};
