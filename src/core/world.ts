import { ClassMap } from "../utils/classmap";
import { Class } from "../types/class";
import { Entity } from "./entity";
import { EventDispatcher } from "./event_dispatcher";
import { System } from "./system";
import { Logger, LoggerColors } from "../utils/logger";
import { Plugin } from "./plugin";
import { assert } from "../utils/assert";

// Entities, Systems, Resources, etc
export class World extends EventDispatcher<{
    systemAdded: System;
    systemRemoved: System;
    resourceAdded: any;
    resourceRemoved: any;
    childAdded: Entity;
    childRemoved: Entity;
}> {
    public readonly systems: ClassMap = new ClassMap();
    public readonly resources: ClassMap = new ClassMap();
    private children: Map<string, Entity> = new Map(); // Children
    public readonly enabledSystems: (Class<System> | string)[] = [];
    private readonly logger = new Logger("World", LoggerColors.blurple);

    constructor() {
        super();
        this.logger.log("World Created");
    }

    addPlugin(plugin: Plugin) {
        plugin.build(this);
    }

    addChild(child: Entity) {
        assert(!this.children.has(child.id), "Tried to add an entity ");
        this.children.set(child.id, child);
        this.connectChild(child);
        this.dispatch("childAdded", child);
    }

    removeChild(id: string) {
        const child = this.children.get(id);
        assert(child, "Can not remove child that was never added");
        this.disconnectChild(child);
        this.dispatch("childRemoved", child);
    }

    getChild(id: string) {
        return this.children.get(id);
    }

    getChildren() {
        return this.children;
    }

    private connectChild(child: Entity) {
        child.systems.forEach((sys) => this.entityEnableSystem(sys, child));
        child.addEventListener(
            "systemEnabled",
            (sys) => this.entityEnableSystem(sys, child),
            { id: child.id }
        );
        child.addEventListener(
            "systemDisabled",
            (sys) => this.entityDisableSystem(sys, child),
            { id: child.id }
        );
    }

    private disconnectChild(child: Entity) {
        child.systems.forEach((sys) => this.entityDisableSystem(sys, child));

        child.removeEventListener("systemEnabled", child.id);
        child.removeEventListener("systemDisabled", child.id);
    }

    private entityEnableSystem(system: Class<System> | string, entity: Entity) {
        const sys = this.systems.get(system);
        sys.entities.set(entity.id, entity);
        sys.dispatch("entityAdded", entity);
    }

    private entityDisableSystem(
        system: Class<System> | string,
        entity: Entity
    ) {
        const sys = this.systems.get(system);
        sys.entities.delete(entity.id);
        sys.dispatch("entityRemoved", entity);
    }

    addSystem(system: System, name?: string) {
        this.systems.set(system, name);
        this.enabledSystems.push(name ? name : system.constructor.name);

        this.logger.log(
            `Added system ${name ? name : system.constructor.name}`
        );
    }

    enableSystem(system: Class<System> | string) {
        this.enabledSystems.push(system);

        this.logger.log(
            `Enabled system ${
                typeof system === "string" ? system : system.constructor.name
            }`
        );
    }

    disableSystem(system: Class<System> | string) {
        this.enabledSystems.filter((sys) => sys !== system);

        this.logger.log(
            `Disabled system ${
                typeof system === "string" ? system : system.constructor.name
            }`
        );
    }

    update(systems: (Class<System> | string)[] | "all", ...args: any[]) {
        if (systems === "all") systems = this.enabledSystems;

        systems.forEach((system) => {
            const sys = this.systems.get(system);
            assert(
                sys,
                `Can not update system "${
                    typeof system === "string" ? system : system.name
                }" does not exist`
            );

            sys.update(...args);
        });
    }

    updateComplex(
        systemsFn: (sys: Class<System> | string) => boolean,
        ...args: any[]
    ) {
        this.systems.forEach((sys, key) => {
            if (systemsFn(key)) {
                const system = this.systems.get(key);
                assert(
                    system,
                    `Can not update system "${
                        typeof system === "string" ? system : system.name
                    }" does not exist`
                );

                system.update(...args);
            }
        });
    }
}
