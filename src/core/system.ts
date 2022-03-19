import { defaultSystemType } from "../config/symbols";
import { Entity } from "./entity";
import { EventDispatcher } from "./event_dispatcher";
import { World } from "./world";

export abstract class System<
    T extends Entity = Entity
> extends EventDispatcher<{
    entityAdded: T;
    entityRemoved: T;
    enabled: void;
    disabled: void;
}> {
    public readonly entities: Map<string, T> = new Map();
    public readonly world: World;

    getTypes(): Symbol[] {
        return [defaultSystemType];
    }

    constructor(world: World) {
        super();
        this.world = world;
    }

    update(...args: any[]) {}
}
