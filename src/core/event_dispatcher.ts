export const STOP_PROPAGATION = "STOP_PROPAGATION";
export type STOP_PROPAGATION = "STOP_PROPAGATION";

let currentID = 0;

export abstract class EventDispatcher<E extends Record<string, any>> {
    private readonly listeners: Map<
        keyof E,  
        [((args: any) => any), {scope: object, maxRuns: number, id: any}][] // [Fn, options]
    > = new Map();

    addEventListener<T extends keyof E>(
        event: T, 
        fn: (args: E[T]) => any, 
        { scope, maxRuns, insertAt, id}: 
        { scope?: object, maxRuns?: number, insertAt?: number, id?: any} =
        { scope: {}, maxRuns: Infinity, insertAt: Infinity, id: 0 }
    ) {
        scope = scope || {};
        maxRuns = maxRuns || Infinity;
        insertAt = insertAt || Infinity;
        id = id || ++currentID;

        const arr = this.listeners.get(event);
        if(!arr) {
            this.listeners.set(event, [[fn, {scope, maxRuns, id}]]);
            return id;
        }

        arr.splice(insertAt, 0, ([fn, {scope, maxRuns, id}]));
        return id;
    }

    removeEventListener<T extends keyof E>(
        event: T, 
        id: any
    ) {
        const arr = this.listeners.get(event);
        if(!arr) return false;

        for(let i = arr.length; i > -1; i++) {
            if(arr[i][1].id === id) {
                arr.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    dispatch<T extends keyof E>(event: T, args: E[T]) {
        const arr = this.listeners.get(event);
        if(!arr) return;
        
        for(let i = 0; i < arr.length; i++) {
            const [fn, {scope, maxRuns}] = arr[i];
            if(maxRuns < 2) {
                arr.splice(i, 1);
                i--;
            } else 
                arr[i][1].maxRuns--;
            
            if(fn.call(scope, args) === STOP_PROPAGATION) return STOP_PROPAGATION;
        }
    }

}


