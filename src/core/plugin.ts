import { Class } from "../types/class";
import { GameObject } from "./game_object";
import { System } from "./system";
import { World } from "./world";

export class Plugin {
    protected addDefaultComponent(component: Class, args?: any[]) {
        GameObject.defaultComponents.push({ component, args });
    }

    protected addDefaultSystem(system: Class<System> | string) {
        GameObject.defaultSystems.push(system);
    }

    protected addMethodToGameObject(
        methodName: string,
        method: (this: GameObject, ...args: any[]) => any
    ) {
        //@ts-ignore
        GameObject.prototype[methodName] = method;
    }

    build(world: World) {
        throw new Error(
            `Plugin "${this.constructor.name}" build method not implemented.`
        );
    }
}
