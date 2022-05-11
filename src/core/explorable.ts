/*
 * ExplorableGraph is a JavaScript project, but we use TypeScript as an internal
 * tool to confirm our code is type safe.
 */

/**
 * Core ExplorableGraph interface
 */
interface Explorable {
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  get(key: any): Promise<any>;
  isKeyExplorable?(key: any): Promise<boolean>;
  set?(...args: any[]): Promise<void>;
  traverse?(...keys: any[]): Promise<any>;
}

/*
 * A class constructor is an object with a `new` method that returns an
 * instance of the indicated type.
 */
type Constructor<T> = new (...args: any[]) => T;

/*
 * A mixin is a function that takes an existing class and returns a new class.
 *
 * The use of a generic type `T` here is a way of indicating that the members of
 * the supplied base class automatically pass through to the result. That
 * ensures the use of the mixin doesn't accidentally hide members of the class
 * passed to the mixin.
 */
type Mixin<MixinMembers> = <T>(
  Base: Constructor<T>
) => Constructor<T & MixinMembers>;

type PlainObject = {
  [key: string]: any;
};

interface HasFunction {
  toFunction(): Function;
}

type Invocable = Explorable | Function | HasFunction;

type GraphVariant = Explorable | PlainObject | string | Function | any[];
