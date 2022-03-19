import { ClassMap } from "../utils/classmap";
import { Class } from "../types/class";
import { EventDispatcher } from "./event_dispatcher";
import { System } from "./system";
import { protectedComponentSymbol } from "../config/symbols";
import { assert } from "../utils/assert";
import { Logger, LoggerColors } from "../utils/logger";

export class Entity extends EventDispatcher<{
    componentAdded: object;
    componentRemoved: object;
    systemEnabled: Class<System> | string;
    systemDisabled: Class<System> | string;
    relationshipAdded: [string, Entity];
    relationshipRemoved: [string, Entity];
}> {
    private static logger: Logger = new Logger("Entity", LoggerColors.teal);

    private readonly components: ClassMap = new ClassMap();
    public readonly systems: (Class | string)[] = [];
    private readonly relationships: Map<string, Map<string, Entity>> =
        new Map();

    constructor(public readonly id: string) {
        super();
        this.id = id;
    }

    addComponent(component: any) {
        assert(!this.components.has(component), "Tried to add component twice");

        this.components.set(component);
        this.dispatch("componentAdded", component);
    }

    getComponent<T extends Class>(component: T | string): InstanceType<T> {
        return this.components.get(component);
    }

    hasComponent(component: Class | string) {
        return this.components.has(component);
    }

    removeComponent<T extends Class>(component: T | string) {
        const componentObj = this.getComponent(component);

        assert(
            componentObj,
            "Can not remove component that is not on an entity"
        );
        assert(
            !componentObj[protectedComponentSymbol],
            "Can not remove protected component"
        );

        this.components.delete(component);
        this.dispatch("componentRemoved", componentObj);
    }

    enableSystem(system: Class | string) {
        // Remove checks in prod
        assert(!this.systems.includes(system), "Tried to enable system twice");

        this.systems.push(system);
        this.dispatch("systemEnabled", system);
        // this.signals.systemEnabled.dispatch(system);
    }

    disableSystem(system: Class | string) {
        const index = this.systems.indexOf(system);
        assert(index > -1, "Cannot disable system that was already disabled");

        this.systems.splice(index, 1);
        this.dispatch("systemDisabled", system);
    }

    hasRelationship(relationship: string) {
        const map = this.relationships.get(relationship);
        if (!map) return false;
        if (map.size === 0) return false;
        return true;
    }

    addRelationship(relationship: string, entity: Entity) {
        if (!this.relationships.has(relationship)) {
            this.relationships.set(
                relationship,
                new Map([[entity.id, entity]])
            );
            return this;
        }

        this.relationships.get(relationship)?.set(entity.id, entity);
        this.dispatch("relationshipAdded", [relationship, entity]);
        return this;
    }

    removeRelationship(relationship: string, entity?: string) {
        const relationships = this.relationships.get(relationship);
        assert(
            relationships,
            `Can not remove relationship "${relationship}" from entity without a "${relationship}" relationship`
        );

        if (!entity) {
            const [[v]] = relationships;
            entity = v;
        }

        const ent = relationships.get(entity);
        assert(
            ent,
            `Can not remove relationship "${relationship} with entity ${entity} because it does not exist`
        );

        relationships.delete(entity);
        this.dispatch("relationshipRemoved", [entity, ent]);
    }

    getRelationship(relationship: string): Map<string, Entity>;
    getRelationship(relationship: string, single: true): Entity;

    getRelationship(
        relationship: string,
        single?: true
    ): Entity | Map<string, Entity> {
        const relationships = this.relationships.get(relationship);
        assert(relationships, "Can not get relationship that doesn't exist");

        if (single) {
            if (relationships.size > 1)
                Entity.logger.log(
                    `Asked for single relationship "${relationship}" on entity with more than one "${relationship}" relationship`
                );
            const [[, v]] = relationships;
            return v;
        }

        return relationships;
    }
}
