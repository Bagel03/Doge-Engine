# Doge Engine

A simple, modular, type-based approach to the ECS architecture written in typescript

---

## Quick Start

```ts
import { World, GameObject } from "doge-engine";
import { DefaultPlugins, Input } from "doge-defaults";

const world = new World();
world.addPlugins(DefaultPlugins);

const player = new GameObject("Player");
world.addChild(player);

player.addScript({
    update(world: World) {
        if (world.getResource(Input).spacebar === 1) {
            player.translate(new Vector(0, 1));
        }
    },
});
```

---

## What Doge Is

Doge Engine (Doge) is a library intended to provide a framework for modeling interactions between many entities in a scene.

In short, Doge gives you all the tools you need to do whatever you would like without worrying about organization and making as much of your code reusable as possible.

Doge is also intended to be extensible (namely through the `GameObject` class and user generated `Plugins`)

To provide the most transparent and easy to understand interface, Doge (the package installed with `npm install doge-engine`) is the _bear bones_ of what could be considered a "Game Engine".

## What Doge Is Not

**Important note:** This does not mean that you can not use Doge for any of the following things, or event that you will have to write implementations for all those things yourself. The _"core Doge library"_ that is installed when you run `npm i doge-engine` just does not provide these things

Doge is not a drop in replacement for unity or unreal, however it should not be considered an end-to-end game engine like unity.

It does not give you access to input, a rendering API, scripts, state management, animation, etc.

## What Doge _could be_

Doge is intentionally small in scope, to make sure that it can provide the best interface and reduce boilerplate and complexity as much as possible.

However, because of it's `Plugin()` system and interconnectedness, Doge can be extend to an infinite amount.

Case in point, with one install of the official default plugins (`npm i doge-defaults`) and one line of code, you can add everything that was discussed in the last paragraph, and some extra quality of life features.

---

# Interface

### Worlds

All Doge applications start with a `World`, that acts as a container for everything in your app.

```ts
// MyProject/main.ts
import { World } from "doge-engine";
const world = new World();
```

### Entities

Entities are "objects" that are in the scene, and are mode of `components`. These represent most "things" in your game. Entities need one argument, a string that represents the unique ID of the entity. No 2 entities in a world may have the same ID.

```ts
import { World } from "doge-engine";
const world = new World();
const player = new Entity("player");
world.addChild(player); // Add the player to the World
```

### Game Objects

Game Objects are just syntactic sugar for Entities, and function the exact same way. Their uses are more apparent in more complex programs (See below)

### Components

Components make up all the data inside an entity. In an effort to make Doge as ergonomic as possible, a component can be _anything_, no need for `extends Component` or `getName()`.

```ts
class MyComponent {
    constructor(public name: string);

    sayHi = () => console.log("Hello from ", this.name);
}

import { ExternalClass } from "package";
```

### Adding Components

To add a component, use the `entity.addComponent(component, name)` function. Without the name parameter, you can only have one component per type, however with it you can use as many of the same types as you want, as long as name is always unique for that Entity.

```ts
player.addComponent(new MyComponent("Joe"));
player.addComponent(new ExternalClass());

player.addComponent(5, "age");
player.addComponent(0, "friends");
```

### Getting Components

To get a component, use either the type of the component or the name that was passed in. If the `name` parameter was passed, that _must_ be used to get the component. You will also need a generic if you want full type support.

```ts
// Typescript knows the types of your components
player.getComponent(MyComponent).sayHi(); // No ts error
player.getComponent(ExternalClass).doExternalStuff();

player.getComponent<number>("age") += 1;
player.getComponent<number>("friends") -= 1;
```

### Systems

Systems are global processes that describe the actions of entities. Just like entities, they can be added to the scene, however they need to extends the base `System` class.

```ts
import { System } from "doge-engine";

class MySystem() extends System {
    update() {
        this.entities.forEach(entity => {
            entity.getComponent(MyComponent).sayHi()
        })
    }
}

world.addSystem(new MySystem());
```

### Enabling Systems

The last block of code does nothing, because it does not target any entities (`this.entities` is empty). To enable a system, use `entity.enableSystem(system)`. Just like components, you can pass in the type or class of the system instead of some hard to remember name

```ts
player.enableSystem(MySystem);
```

### Updating systems

Despite enabling the system, the program still does nothing. This is because `MySystem.update()` is never called. You could call it manually, but it is better to let the world handle it for you:

```ts
world.update([MySystem]);
```

Now there will be messages in the console showing that the system has run once. Doge also supports updating all enabled systems:

```ts
world.update("all");
```

### Resources

Sometimes, it is not useful for something to be an Entity. Perhaps is its just not a "thing" that should be in the scene, or it shouldn't interact with any systems. Resources allow you to keep track of these objects and not worry about passing them around. It can be helpful to think of resources as "Components for worlds", and the API is very similar:

```ts
class MyResource {
    keyDown: boolean = false;

    constructor() {
        window.addEventListener("keydown", (e) => (this.keyDown = true));
        window.addEventListener("keyup", (e) => (this.keyDown = false));
    }
}

world.addResource(MyResource);
world.addResource(Date.now(), "start-time");
```

And later in your code

```ts
if (world.getResource(MyResource).keyDown) {
    entity.getComponent(MyComponent).sayHi();
}

console.log(
    "Time elapsed: ",
    Date.now() - world.getResource<number>("start-time")
);
```

Most of the time resource should be used for _one global thing_ that doesn't need to interact with anything else or use components. Just because there is one of something doesn't mean it should be a resource, for example there may only be one player, but it makes more sense to make it an `Entity` with components for collision, rendering, and movement.

### Plugins

Plugins are how Doge is extended beyond its very bare-bones core. Implementing one is very easy (it is hardly more than a wrapper with helper methods), but they provide much of the "end usefulness" that a game would need.

```ts
class MyPlugin extends Plugin {
    build(world: World) {
        world.addSystem(new MySystem());
        world.addResource(new MyResource());
    }
}
```

And to add it:

```ts
world.addPlugin(new MyPlugin());
```

They may seem like optional boilerplate, which is the opposite of Doge's goal, however they are not _meant_ to be created for applications like this. They are used as a consistent method of adding functionality from libraries to a larger base. This is how you can add rendering, scripting, etc with the `defaultPlugins` no matter your project layout.

## Advanced Interface

### Decorators

Doge provides a few decorators to make your life easier and to provide extra functionality:

#### **`@name`: Allows you to rename components or systems without using the extra name parameter.**

```ts
class MyComponent {}
entity.addComponent(new MyComponent()); // Works fine
entity.getComponent(MyComponent); // Also works fine
entity.addComponent(5, "MyComponent"); // Fail, 2 "MyComponent" components
```

To fix:

```ts
@name("MyOtherComponent");
class MyComponent {}
entity.addComponent(new MyComponent()); // Works fine
entity.getComponent(MyComponent); // Also works fine
// All good, one "MyOtherComponent" and one "MyComponent"
entity.addComponent(5, "MyComponent");
// Also works with systems
```

#### **`@protectedComponent`: Assert that this is a protected component ##(Can not be removed after it is added)**

This is useful for library's that want to add functionality and don't want to worry about users accidentally removing that component.

```ts
@protectedComponent
class MyComponent {}

entity.addComponent(new MyComponent());
entity.removeComponent(MyComponent); // Fails, cannot remove protected component
```

#### **`@defaultComponent(...args)`: Register this component as a default component with default args `...args` (All `GameObjects` will automatically have this component when they are created).**

Removes repetitive code and gives libraries control of created objects.

```ts
@defaultComponent("defaultName")
class MyComponent {
    constructor(public name: string);
}

const object = new GameObject("id");
object.getComponent(MyComponent).name; // "defaultName"
```

#### **`@defaultSystem`: Register this system as a default system (All `GameObjects` will automatically enable this system when they are created).**

```ts
@defaultSystem
class MySystem extends System {
    update() {
        this.entities.forEach((entity) =>
            entity.getComponent(MyComponent).sayHi()
        );
    }
}

world.addSystem(new MySystem());
world.addChild(new GameObject("id"));
world.update("all"); // Hello from the "id" object
```

**Decorator footnotes:**

-   Use `@defaultSystem` and `@defaultComponent` as much as possible (when it makes sense). Makes it a lot easier to add objects.
-   `@defaultComponent` & `@protectedComponent` _grantees_ that all GameObjects have that component. Very useful for libraries.
-   Use `@name` only to avoid naming conflicts (ie. A library plugin already adds a plugin with the same class name)

### Extending `GameObject`

The easiest way to use plugins to add functionality is to extend GameObject. While simple programs may use Entity, **All complex programs should use GameObject**. It will reduce the amount of code needed to be written and make the esperance a lot better.

In addition to `@defaultSystem` and `@defaultComponent`, plugins can augment the GameObject class themselves (They can do this to any class, but it is not recommended\*):

ExternalLib.ts:

```ts
export class LibPlugin extends Plugin {
    build() {
        // Error on next line, getLocation does not exist on GameObject
        GameObject.prototype.getLocation = function () {
            return this.getComponent(Position).localPosition.toVector2();
        };
    }
}
```

MyProject.ts

```ts
import { World } from "doge-engine";
import { LibPlugin } from "externalLib";

const world = new World();
world.addPlugin(new LibPlugin());

const obj = new GameObject("id");

// Same Error, getLocation does not exist on GameObject
console.log(obj.getLocation());
```

To fix the type errors, you need to use module augmentation:
ExternalLib.ts:

```ts
import {Plugin, GameObject } from "doge-engine";
declare module "doge-engine" {
    export interface GameObject {
        getLocation(): string;
    }
}

export class LibPlugin extends Plugin {
...
```

And now both errors should go away

---

## Bug reporting

If you find a bug, please open an issue and explain in as much detail as possible:

-   What you did
-   What you expected
-   What happened
-   Extra information (Browser, tsc version, etc.)

## Feature Requests:

If you have a feature in mind, please make sure the answer to all of the following is **"no"**:

1. Does this go against Doge's design goals?
    - Is there any removable boilerplate?
    - Does this overcomplicate the core library?
    - Is this extremely specific?
    - Could / Should this be made as a plugin?
2. Is it extremely general or requires large restructuring?
3. Would this break existing plugins?

Submit an issue with a title `[Feature Request]: Your Request` and explain what you want and why the current library does not fit this goal.

## Contributing

If you would like to contribute, please make sure the answer to all of the following is **"no"**:

1. Is this contribution unnecessary?
2. Could this be made as a plugin?
3. Could it be friendlier to use.

Submit a PR, and I will have a look over it.

---

Happy debugging --Bagel03
