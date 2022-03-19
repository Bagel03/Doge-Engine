import { Class } from "../types/class";
import { Entity } from "./entity";
import { System } from "./system";

/**
 * @description A wrapper for most entities that sets up all the defaults for you
 */
export class GameObject extends Entity {
    static defaultComponents: {
        component: Class;
        args?: any[];
    }[] = [];

    static defaultSystems: (Class<System> | string)[] = [];

    constructor(id: string) {
        super(id);

        // this.addComponent(new HierarchyComponent(this));
        // this.addComponent(new PositionComponent(3, this));
        // this.addComponent(new ScriptComponent(this));
        // this.addComponent(new StateManagerComponent(this));

        GameObject.defaultComponents.forEach((obj) =>
            this.addComponent(
                new obj.component(this, ...(obj.args ? obj.args : []))
            )
        );
        GameObject.defaultSystems.forEach((sys) => this.enableSystem(sys));
        // this.enableSystem(ScriptSystem);
    }
}
