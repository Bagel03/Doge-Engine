import { assert, Logger, LoggerColors } from "doge-engine";
import { KeysOfType, WithOnlyType } from "engine/types/with";
import { Class } from "../types/class";
import { Entity } from "./entity";
import { System } from "./system";

type GameObjectMethods = WithOnlyType<GameObject, (...args: any[]) => any>;
const logger = new Logger("Game Object", LoggerColors.blue);

/**
 * @description A wrapper for most entities that allows extending
 */
export class GameObject extends Entity {
    static defaultComponents: {
        component: Class;
        args?: any[];
    }[] = [];
    static defaultSystems: (Class<System> | string)[] = [];

    constructor(id: string) {
        super(id);

        GameObject.defaultComponents.forEach((obj) =>
            this.addComponent(
                new obj.component(this, ...(obj.args ? obj.args : []))
            )
        );
        GameObject.defaultSystems.forEach((sys) => this.enableSystem(sys));
    }

    static overloads: string[];

    static addMethod<N extends keyof GameObjectMethods>(
        name: N,
        method: Extract<GameObjectMethods[N], (...args: any[]) => any>
    ) {
        assert(
            !this.overloads.includes(name),
            `Tried to add a gameObject method twice`
        );

        this.prototype[name] = method;
        this.overloads.push(name);
        logger.log(`Added method ${name} to all GameObjects`);
    }
}

export declare interface GameObject {
    urMom(str: string): string;
}
GameObject.addMethod("urMom", (str) => "");
