
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model app_installs
 * This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
 */
export type app_installs = $Result.DefaultSelection<Prisma.$app_installsPayload>
/**
 * Model reminder_content
 * 
 */
export type reminder_content = $Result.DefaultSelection<Prisma.$reminder_contentPayload>
/**
 * Model reminder_users
 * 
 */
export type reminder_users = $Result.DefaultSelection<Prisma.$reminder_usersPayload>
/**
 * Model users
 * 
 */
export type users = $Result.DefaultSelection<Prisma.$usersPayload>
/**
 * Model Server
 * 
 */
export type Server = $Result.DefaultSelection<Prisma.$ServerPayload>
/**
 * Model Settings
 * 
 */
export type Settings = $Result.DefaultSelection<Prisma.$SettingsPayload>
/**
 * Model RequestLog
 * 
 */
export type RequestLog = $Result.DefaultSelection<Prisma.$RequestLogPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const CampusLocation: {
  URBAN: 'URBAN',
  RURAL: 'RURAL'
};

export type CampusLocation = (typeof CampusLocation)[keyof typeof CampusLocation]


export const ReminderStatus: {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export type ReminderStatus = (typeof ReminderStatus)[keyof typeof ReminderStatus]


export const Algorithm: {
  ROUND_ROBIN: 'ROUND_ROBIN',
  LEAST_CONNECTIONS: 'LEAST_CONNECTIONS',
  WEIGHTED_ROUND_ROBIN: 'WEIGHTED_ROUND_ROBIN',
  IP_HASH: 'IP_HASH',
  RANDOM: 'RANDOM',
  PRIORITY: 'PRIORITY'
};

export type Algorithm = (typeof Algorithm)[keyof typeof Algorithm]


export const ServerHealth: {
  HEALTHY: 'HEALTHY',
  UNHEALTHY: 'UNHEALTHY',
  UNKNOWN: 'UNKNOWN'
};

export type ServerHealth = (typeof ServerHealth)[keyof typeof ServerHealth]


export const HttpMethod: {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS'
};

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod]

}

export type CampusLocation = $Enums.CampusLocation

export const CampusLocation: typeof $Enums.CampusLocation

export type ReminderStatus = $Enums.ReminderStatus

export const ReminderStatus: typeof $Enums.ReminderStatus

export type Algorithm = $Enums.Algorithm

export const Algorithm: typeof $Enums.Algorithm

export type ServerHealth = $Enums.ServerHealth

export const ServerHealth: typeof $Enums.ServerHealth

export type HttpMethod = $Enums.HttpMethod

export const HttpMethod: typeof $Enums.HttpMethod

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more App_installs
 * const app_installs = await prisma.app_installs.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more App_installs
   * const app_installs = await prisma.app_installs.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.app_installs`: Exposes CRUD operations for the **app_installs** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more App_installs
    * const app_installs = await prisma.app_installs.findMany()
    * ```
    */
  get app_installs(): Prisma.app_installsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.reminder_content`: Exposes CRUD operations for the **reminder_content** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Reminder_contents
    * const reminder_contents = await prisma.reminder_content.findMany()
    * ```
    */
  get reminder_content(): Prisma.reminder_contentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.reminder_users`: Exposes CRUD operations for the **reminder_users** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Reminder_users
    * const reminder_users = await prisma.reminder_users.findMany()
    * ```
    */
  get reminder_users(): Prisma.reminder_usersDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.users`: Exposes CRUD operations for the **users** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.users.findMany()
    * ```
    */
  get users(): Prisma.usersDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.server`: Exposes CRUD operations for the **Server** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Servers
    * const servers = await prisma.server.findMany()
    * ```
    */
  get server(): Prisma.ServerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.settings`: Exposes CRUD operations for the **Settings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Settings
    * const settings = await prisma.settings.findMany()
    * ```
    */
  get settings(): Prisma.SettingsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.requestLog`: Exposes CRUD operations for the **RequestLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RequestLogs
    * const requestLogs = await prisma.requestLog.findMany()
    * ```
    */
  get requestLog(): Prisma.RequestLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.9.0
   * Query Engine version: e922089b7d7502aff4249d5da3420f6fa55fc6ad
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    app_installs: 'app_installs',
    reminder_content: 'reminder_content',
    reminder_users: 'reminder_users',
    users: 'users',
    Server: 'Server',
    Settings: 'Settings',
    RequestLog: 'RequestLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "app_installs" | "reminder_content" | "reminder_users" | "users" | "server" | "settings" | "requestLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      app_installs: {
        payload: Prisma.$app_installsPayload<ExtArgs>
        fields: Prisma.app_installsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.app_installsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$app_installsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.app_installsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$app_installsPayload>
          }
          findFirst: {
            args: Prisma.app_installsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$app_installsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.app_installsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$app_installsPayload>
          }
          findMany: {
            args: Prisma.app_installsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$app_installsPayload>[]
          }
          create: {
            args: Prisma.app_installsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$app_installsPayload>
          }
          createMany: {
            args: Prisma.app_installsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.app_installsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$app_installsPayload>[]
          }
          delete: {
            args: Prisma.app_installsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$app_installsPayload>
          }
          update: {
            args: Prisma.app_installsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$app_installsPayload>
          }
          deleteMany: {
            args: Prisma.app_installsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.app_installsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.app_installsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$app_installsPayload>[]
          }
          upsert: {
            args: Prisma.app_installsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$app_installsPayload>
          }
          aggregate: {
            args: Prisma.App_installsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApp_installs>
          }
          groupBy: {
            args: Prisma.app_installsGroupByArgs<ExtArgs>
            result: $Utils.Optional<App_installsGroupByOutputType>[]
          }
          count: {
            args: Prisma.app_installsCountArgs<ExtArgs>
            result: $Utils.Optional<App_installsCountAggregateOutputType> | number
          }
        }
      }
      reminder_content: {
        payload: Prisma.$reminder_contentPayload<ExtArgs>
        fields: Prisma.reminder_contentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.reminder_contentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_contentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.reminder_contentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_contentPayload>
          }
          findFirst: {
            args: Prisma.reminder_contentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_contentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.reminder_contentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_contentPayload>
          }
          findMany: {
            args: Prisma.reminder_contentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_contentPayload>[]
          }
          create: {
            args: Prisma.reminder_contentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_contentPayload>
          }
          createMany: {
            args: Prisma.reminder_contentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.reminder_contentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_contentPayload>[]
          }
          delete: {
            args: Prisma.reminder_contentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_contentPayload>
          }
          update: {
            args: Prisma.reminder_contentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_contentPayload>
          }
          deleteMany: {
            args: Prisma.reminder_contentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.reminder_contentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.reminder_contentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_contentPayload>[]
          }
          upsert: {
            args: Prisma.reminder_contentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_contentPayload>
          }
          aggregate: {
            args: Prisma.Reminder_contentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReminder_content>
          }
          groupBy: {
            args: Prisma.reminder_contentGroupByArgs<ExtArgs>
            result: $Utils.Optional<Reminder_contentGroupByOutputType>[]
          }
          count: {
            args: Prisma.reminder_contentCountArgs<ExtArgs>
            result: $Utils.Optional<Reminder_contentCountAggregateOutputType> | number
          }
        }
      }
      reminder_users: {
        payload: Prisma.$reminder_usersPayload<ExtArgs>
        fields: Prisma.reminder_usersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.reminder_usersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_usersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.reminder_usersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_usersPayload>
          }
          findFirst: {
            args: Prisma.reminder_usersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_usersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.reminder_usersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_usersPayload>
          }
          findMany: {
            args: Prisma.reminder_usersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_usersPayload>[]
          }
          create: {
            args: Prisma.reminder_usersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_usersPayload>
          }
          createMany: {
            args: Prisma.reminder_usersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.reminder_usersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_usersPayload>[]
          }
          delete: {
            args: Prisma.reminder_usersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_usersPayload>
          }
          update: {
            args: Prisma.reminder_usersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_usersPayload>
          }
          deleteMany: {
            args: Prisma.reminder_usersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.reminder_usersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.reminder_usersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_usersPayload>[]
          }
          upsert: {
            args: Prisma.reminder_usersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reminder_usersPayload>
          }
          aggregate: {
            args: Prisma.Reminder_usersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReminder_users>
          }
          groupBy: {
            args: Prisma.reminder_usersGroupByArgs<ExtArgs>
            result: $Utils.Optional<Reminder_usersGroupByOutputType>[]
          }
          count: {
            args: Prisma.reminder_usersCountArgs<ExtArgs>
            result: $Utils.Optional<Reminder_usersCountAggregateOutputType> | number
          }
        }
      }
      users: {
        payload: Prisma.$usersPayload<ExtArgs>
        fields: Prisma.usersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.usersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.usersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          findFirst: {
            args: Prisma.usersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.usersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          findMany: {
            args: Prisma.usersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          create: {
            args: Prisma.usersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          createMany: {
            args: Prisma.usersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.usersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          delete: {
            args: Prisma.usersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          update: {
            args: Prisma.usersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          deleteMany: {
            args: Prisma.usersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.usersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.usersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          upsert: {
            args: Prisma.usersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          aggregate: {
            args: Prisma.UsersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsers>
          }
          groupBy: {
            args: Prisma.usersGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsersGroupByOutputType>[]
          }
          count: {
            args: Prisma.usersCountArgs<ExtArgs>
            result: $Utils.Optional<UsersCountAggregateOutputType> | number
          }
        }
      }
      Server: {
        payload: Prisma.$ServerPayload<ExtArgs>
        fields: Prisma.ServerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ServerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ServerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServerPayload>
          }
          findFirst: {
            args: Prisma.ServerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ServerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServerPayload>
          }
          findMany: {
            args: Prisma.ServerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServerPayload>[]
          }
          create: {
            args: Prisma.ServerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServerPayload>
          }
          createMany: {
            args: Prisma.ServerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ServerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServerPayload>[]
          }
          delete: {
            args: Prisma.ServerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServerPayload>
          }
          update: {
            args: Prisma.ServerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServerPayload>
          }
          deleteMany: {
            args: Prisma.ServerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ServerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ServerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServerPayload>[]
          }
          upsert: {
            args: Prisma.ServerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServerPayload>
          }
          aggregate: {
            args: Prisma.ServerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateServer>
          }
          groupBy: {
            args: Prisma.ServerGroupByArgs<ExtArgs>
            result: $Utils.Optional<ServerGroupByOutputType>[]
          }
          count: {
            args: Prisma.ServerCountArgs<ExtArgs>
            result: $Utils.Optional<ServerCountAggregateOutputType> | number
          }
        }
      }
      Settings: {
        payload: Prisma.$SettingsPayload<ExtArgs>
        fields: Prisma.SettingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SettingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SettingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          findFirst: {
            args: Prisma.SettingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SettingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          findMany: {
            args: Prisma.SettingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          create: {
            args: Prisma.SettingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          createMany: {
            args: Prisma.SettingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SettingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          delete: {
            args: Prisma.SettingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          update: {
            args: Prisma.SettingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          deleteMany: {
            args: Prisma.SettingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SettingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SettingsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          upsert: {
            args: Prisma.SettingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          aggregate: {
            args: Prisma.SettingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSettings>
          }
          groupBy: {
            args: Prisma.SettingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<SettingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.SettingsCountArgs<ExtArgs>
            result: $Utils.Optional<SettingsCountAggregateOutputType> | number
          }
        }
      }
      RequestLog: {
        payload: Prisma.$RequestLogPayload<ExtArgs>
        fields: Prisma.RequestLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RequestLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RequestLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestLogPayload>
          }
          findFirst: {
            args: Prisma.RequestLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RequestLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestLogPayload>
          }
          findMany: {
            args: Prisma.RequestLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestLogPayload>[]
          }
          create: {
            args: Prisma.RequestLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestLogPayload>
          }
          createMany: {
            args: Prisma.RequestLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RequestLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestLogPayload>[]
          }
          delete: {
            args: Prisma.RequestLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestLogPayload>
          }
          update: {
            args: Prisma.RequestLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestLogPayload>
          }
          deleteMany: {
            args: Prisma.RequestLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RequestLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RequestLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestLogPayload>[]
          }
          upsert: {
            args: Prisma.RequestLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestLogPayload>
          }
          aggregate: {
            args: Prisma.RequestLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRequestLog>
          }
          groupBy: {
            args: Prisma.RequestLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<RequestLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.RequestLogCountArgs<ExtArgs>
            result: $Utils.Optional<RequestLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    app_installs?: app_installsOmit
    reminder_content?: reminder_contentOmit
    reminder_users?: reminder_usersOmit
    users?: usersOmit
    server?: ServerOmit
    settings?: SettingsOmit
    requestLog?: RequestLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type Reminder_usersCountOutputType
   */

  export type Reminder_usersCountOutputType = {
    reminder_content: number
  }

  export type Reminder_usersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reminder_content?: boolean | Reminder_usersCountOutputTypeCountReminder_contentArgs
  }

  // Custom InputTypes
  /**
   * Reminder_usersCountOutputType without action
   */
  export type Reminder_usersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reminder_usersCountOutputType
     */
    select?: Reminder_usersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Reminder_usersCountOutputType without action
   */
  export type Reminder_usersCountOutputTypeCountReminder_contentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: reminder_contentWhereInput
  }


  /**
   * Models
   */

  /**
   * Model app_installs
   */

  export type AggregateApp_installs = {
    _count: App_installsCountAggregateOutputType | null
    _min: App_installsMinAggregateOutputType | null
    _max: App_installsMaxAggregateOutputType | null
  }

  export type App_installsMinAggregateOutputType = {
    id: string | null
    user_id: string | null
    device_id: string | null
    platform: string | null
    app_version: string | null
    installed_at: Date | null
    last_active: Date | null
  }

  export type App_installsMaxAggregateOutputType = {
    id: string | null
    user_id: string | null
    device_id: string | null
    platform: string | null
    app_version: string | null
    installed_at: Date | null
    last_active: Date | null
  }

  export type App_installsCountAggregateOutputType = {
    id: number
    user_id: number
    device_id: number
    platform: number
    app_version: number
    installed_at: number
    last_active: number
    _all: number
  }


  export type App_installsMinAggregateInputType = {
    id?: true
    user_id?: true
    device_id?: true
    platform?: true
    app_version?: true
    installed_at?: true
    last_active?: true
  }

  export type App_installsMaxAggregateInputType = {
    id?: true
    user_id?: true
    device_id?: true
    platform?: true
    app_version?: true
    installed_at?: true
    last_active?: true
  }

  export type App_installsCountAggregateInputType = {
    id?: true
    user_id?: true
    device_id?: true
    platform?: true
    app_version?: true
    installed_at?: true
    last_active?: true
    _all?: true
  }

  export type App_installsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which app_installs to aggregate.
     */
    where?: app_installsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of app_installs to fetch.
     */
    orderBy?: app_installsOrderByWithRelationInput | app_installsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: app_installsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` app_installs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` app_installs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned app_installs
    **/
    _count?: true | App_installsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: App_installsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: App_installsMaxAggregateInputType
  }

  export type GetApp_installsAggregateType<T extends App_installsAggregateArgs> = {
        [P in keyof T & keyof AggregateApp_installs]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApp_installs[P]>
      : GetScalarType<T[P], AggregateApp_installs[P]>
  }




  export type app_installsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: app_installsWhereInput
    orderBy?: app_installsOrderByWithAggregationInput | app_installsOrderByWithAggregationInput[]
    by: App_installsScalarFieldEnum[] | App_installsScalarFieldEnum
    having?: app_installsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: App_installsCountAggregateInputType | true
    _min?: App_installsMinAggregateInputType
    _max?: App_installsMaxAggregateInputType
  }

  export type App_installsGroupByOutputType = {
    id: string
    user_id: string | null
    device_id: string
    platform: string
    app_version: string | null
    installed_at: Date | null
    last_active: Date | null
    _count: App_installsCountAggregateOutputType | null
    _min: App_installsMinAggregateOutputType | null
    _max: App_installsMaxAggregateOutputType | null
  }

  type GetApp_installsGroupByPayload<T extends app_installsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<App_installsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof App_installsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], App_installsGroupByOutputType[P]>
            : GetScalarType<T[P], App_installsGroupByOutputType[P]>
        }
      >
    >


  export type app_installsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    device_id?: boolean
    platform?: boolean
    app_version?: boolean
    installed_at?: boolean
    last_active?: boolean
    reminder_users?: boolean | app_installs$reminder_usersArgs<ExtArgs>
  }, ExtArgs["result"]["app_installs"]>

  export type app_installsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    device_id?: boolean
    platform?: boolean
    app_version?: boolean
    installed_at?: boolean
    last_active?: boolean
  }, ExtArgs["result"]["app_installs"]>

  export type app_installsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    device_id?: boolean
    platform?: boolean
    app_version?: boolean
    installed_at?: boolean
    last_active?: boolean
  }, ExtArgs["result"]["app_installs"]>

  export type app_installsSelectScalar = {
    id?: boolean
    user_id?: boolean
    device_id?: boolean
    platform?: boolean
    app_version?: boolean
    installed_at?: boolean
    last_active?: boolean
  }

  export type app_installsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "user_id" | "device_id" | "platform" | "app_version" | "installed_at" | "last_active", ExtArgs["result"]["app_installs"]>
  export type app_installsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reminder_users?: boolean | app_installs$reminder_usersArgs<ExtArgs>
  }
  export type app_installsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type app_installsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $app_installsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "app_installs"
    objects: {
      reminder_users: Prisma.$reminder_usersPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      user_id: string | null
      device_id: string
      platform: string
      app_version: string | null
      installed_at: Date | null
      last_active: Date | null
    }, ExtArgs["result"]["app_installs"]>
    composites: {}
  }

  type app_installsGetPayload<S extends boolean | null | undefined | app_installsDefaultArgs> = $Result.GetResult<Prisma.$app_installsPayload, S>

  type app_installsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<app_installsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: App_installsCountAggregateInputType | true
    }

  export interface app_installsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['app_installs'], meta: { name: 'app_installs' } }
    /**
     * Find zero or one App_installs that matches the filter.
     * @param {app_installsFindUniqueArgs} args - Arguments to find a App_installs
     * @example
     * // Get one App_installs
     * const app_installs = await prisma.app_installs.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends app_installsFindUniqueArgs>(args: SelectSubset<T, app_installsFindUniqueArgs<ExtArgs>>): Prisma__app_installsClient<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one App_installs that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {app_installsFindUniqueOrThrowArgs} args - Arguments to find a App_installs
     * @example
     * // Get one App_installs
     * const app_installs = await prisma.app_installs.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends app_installsFindUniqueOrThrowArgs>(args: SelectSubset<T, app_installsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__app_installsClient<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first App_installs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {app_installsFindFirstArgs} args - Arguments to find a App_installs
     * @example
     * // Get one App_installs
     * const app_installs = await prisma.app_installs.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends app_installsFindFirstArgs>(args?: SelectSubset<T, app_installsFindFirstArgs<ExtArgs>>): Prisma__app_installsClient<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first App_installs that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {app_installsFindFirstOrThrowArgs} args - Arguments to find a App_installs
     * @example
     * // Get one App_installs
     * const app_installs = await prisma.app_installs.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends app_installsFindFirstOrThrowArgs>(args?: SelectSubset<T, app_installsFindFirstOrThrowArgs<ExtArgs>>): Prisma__app_installsClient<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more App_installs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {app_installsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all App_installs
     * const app_installs = await prisma.app_installs.findMany()
     * 
     * // Get first 10 App_installs
     * const app_installs = await prisma.app_installs.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const app_installsWithIdOnly = await prisma.app_installs.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends app_installsFindManyArgs>(args?: SelectSubset<T, app_installsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a App_installs.
     * @param {app_installsCreateArgs} args - Arguments to create a App_installs.
     * @example
     * // Create one App_installs
     * const App_installs = await prisma.app_installs.create({
     *   data: {
     *     // ... data to create a App_installs
     *   }
     * })
     * 
     */
    create<T extends app_installsCreateArgs>(args: SelectSubset<T, app_installsCreateArgs<ExtArgs>>): Prisma__app_installsClient<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many App_installs.
     * @param {app_installsCreateManyArgs} args - Arguments to create many App_installs.
     * @example
     * // Create many App_installs
     * const app_installs = await prisma.app_installs.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends app_installsCreateManyArgs>(args?: SelectSubset<T, app_installsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many App_installs and returns the data saved in the database.
     * @param {app_installsCreateManyAndReturnArgs} args - Arguments to create many App_installs.
     * @example
     * // Create many App_installs
     * const app_installs = await prisma.app_installs.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many App_installs and only return the `id`
     * const app_installsWithIdOnly = await prisma.app_installs.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends app_installsCreateManyAndReturnArgs>(args?: SelectSubset<T, app_installsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a App_installs.
     * @param {app_installsDeleteArgs} args - Arguments to delete one App_installs.
     * @example
     * // Delete one App_installs
     * const App_installs = await prisma.app_installs.delete({
     *   where: {
     *     // ... filter to delete one App_installs
     *   }
     * })
     * 
     */
    delete<T extends app_installsDeleteArgs>(args: SelectSubset<T, app_installsDeleteArgs<ExtArgs>>): Prisma__app_installsClient<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one App_installs.
     * @param {app_installsUpdateArgs} args - Arguments to update one App_installs.
     * @example
     * // Update one App_installs
     * const app_installs = await prisma.app_installs.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends app_installsUpdateArgs>(args: SelectSubset<T, app_installsUpdateArgs<ExtArgs>>): Prisma__app_installsClient<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more App_installs.
     * @param {app_installsDeleteManyArgs} args - Arguments to filter App_installs to delete.
     * @example
     * // Delete a few App_installs
     * const { count } = await prisma.app_installs.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends app_installsDeleteManyArgs>(args?: SelectSubset<T, app_installsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more App_installs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {app_installsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many App_installs
     * const app_installs = await prisma.app_installs.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends app_installsUpdateManyArgs>(args: SelectSubset<T, app_installsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more App_installs and returns the data updated in the database.
     * @param {app_installsUpdateManyAndReturnArgs} args - Arguments to update many App_installs.
     * @example
     * // Update many App_installs
     * const app_installs = await prisma.app_installs.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more App_installs and only return the `id`
     * const app_installsWithIdOnly = await prisma.app_installs.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends app_installsUpdateManyAndReturnArgs>(args: SelectSubset<T, app_installsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one App_installs.
     * @param {app_installsUpsertArgs} args - Arguments to update or create a App_installs.
     * @example
     * // Update or create a App_installs
     * const app_installs = await prisma.app_installs.upsert({
     *   create: {
     *     // ... data to create a App_installs
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the App_installs we want to update
     *   }
     * })
     */
    upsert<T extends app_installsUpsertArgs>(args: SelectSubset<T, app_installsUpsertArgs<ExtArgs>>): Prisma__app_installsClient<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of App_installs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {app_installsCountArgs} args - Arguments to filter App_installs to count.
     * @example
     * // Count the number of App_installs
     * const count = await prisma.app_installs.count({
     *   where: {
     *     // ... the filter for the App_installs we want to count
     *   }
     * })
    **/
    count<T extends app_installsCountArgs>(
      args?: Subset<T, app_installsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], App_installsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a App_installs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {App_installsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends App_installsAggregateArgs>(args: Subset<T, App_installsAggregateArgs>): Prisma.PrismaPromise<GetApp_installsAggregateType<T>>

    /**
     * Group by App_installs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {app_installsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends app_installsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: app_installsGroupByArgs['orderBy'] }
        : { orderBy?: app_installsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, app_installsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApp_installsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the app_installs model
   */
  readonly fields: app_installsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for app_installs.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__app_installsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    reminder_users<T extends app_installs$reminder_usersArgs<ExtArgs> = {}>(args?: Subset<T, app_installs$reminder_usersArgs<ExtArgs>>): Prisma__reminder_usersClient<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the app_installs model
   */
  interface app_installsFieldRefs {
    readonly id: FieldRef<"app_installs", 'String'>
    readonly user_id: FieldRef<"app_installs", 'String'>
    readonly device_id: FieldRef<"app_installs", 'String'>
    readonly platform: FieldRef<"app_installs", 'String'>
    readonly app_version: FieldRef<"app_installs", 'String'>
    readonly installed_at: FieldRef<"app_installs", 'DateTime'>
    readonly last_active: FieldRef<"app_installs", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * app_installs findUnique
   */
  export type app_installsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: app_installsInclude<ExtArgs> | null
    /**
     * Filter, which app_installs to fetch.
     */
    where: app_installsWhereUniqueInput
  }

  /**
   * app_installs findUniqueOrThrow
   */
  export type app_installsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: app_installsInclude<ExtArgs> | null
    /**
     * Filter, which app_installs to fetch.
     */
    where: app_installsWhereUniqueInput
  }

  /**
   * app_installs findFirst
   */
  export type app_installsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: app_installsInclude<ExtArgs> | null
    /**
     * Filter, which app_installs to fetch.
     */
    where?: app_installsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of app_installs to fetch.
     */
    orderBy?: app_installsOrderByWithRelationInput | app_installsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for app_installs.
     */
    cursor?: app_installsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` app_installs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` app_installs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of app_installs.
     */
    distinct?: App_installsScalarFieldEnum | App_installsScalarFieldEnum[]
  }

  /**
   * app_installs findFirstOrThrow
   */
  export type app_installsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: app_installsInclude<ExtArgs> | null
    /**
     * Filter, which app_installs to fetch.
     */
    where?: app_installsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of app_installs to fetch.
     */
    orderBy?: app_installsOrderByWithRelationInput | app_installsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for app_installs.
     */
    cursor?: app_installsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` app_installs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` app_installs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of app_installs.
     */
    distinct?: App_installsScalarFieldEnum | App_installsScalarFieldEnum[]
  }

  /**
   * app_installs findMany
   */
  export type app_installsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: app_installsInclude<ExtArgs> | null
    /**
     * Filter, which app_installs to fetch.
     */
    where?: app_installsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of app_installs to fetch.
     */
    orderBy?: app_installsOrderByWithRelationInput | app_installsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing app_installs.
     */
    cursor?: app_installsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` app_installs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` app_installs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of app_installs.
     */
    distinct?: App_installsScalarFieldEnum | App_installsScalarFieldEnum[]
  }

  /**
   * app_installs create
   */
  export type app_installsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: app_installsInclude<ExtArgs> | null
    /**
     * The data needed to create a app_installs.
     */
    data: XOR<app_installsCreateInput, app_installsUncheckedCreateInput>
  }

  /**
   * app_installs createMany
   */
  export type app_installsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many app_installs.
     */
    data: app_installsCreateManyInput | app_installsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * app_installs createManyAndReturn
   */
  export type app_installsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * The data used to create many app_installs.
     */
    data: app_installsCreateManyInput | app_installsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * app_installs update
   */
  export type app_installsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: app_installsInclude<ExtArgs> | null
    /**
     * The data needed to update a app_installs.
     */
    data: XOR<app_installsUpdateInput, app_installsUncheckedUpdateInput>
    /**
     * Choose, which app_installs to update.
     */
    where: app_installsWhereUniqueInput
  }

  /**
   * app_installs updateMany
   */
  export type app_installsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update app_installs.
     */
    data: XOR<app_installsUpdateManyMutationInput, app_installsUncheckedUpdateManyInput>
    /**
     * Filter which app_installs to update
     */
    where?: app_installsWhereInput
    /**
     * Limit how many app_installs to update.
     */
    limit?: number
  }

  /**
   * app_installs updateManyAndReturn
   */
  export type app_installsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * The data used to update app_installs.
     */
    data: XOR<app_installsUpdateManyMutationInput, app_installsUncheckedUpdateManyInput>
    /**
     * Filter which app_installs to update
     */
    where?: app_installsWhereInput
    /**
     * Limit how many app_installs to update.
     */
    limit?: number
  }

  /**
   * app_installs upsert
   */
  export type app_installsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: app_installsInclude<ExtArgs> | null
    /**
     * The filter to search for the app_installs to update in case it exists.
     */
    where: app_installsWhereUniqueInput
    /**
     * In case the app_installs found by the `where` argument doesn't exist, create a new app_installs with this data.
     */
    create: XOR<app_installsCreateInput, app_installsUncheckedCreateInput>
    /**
     * In case the app_installs was found with the provided `where` argument, update it with this data.
     */
    update: XOR<app_installsUpdateInput, app_installsUncheckedUpdateInput>
  }

  /**
   * app_installs delete
   */
  export type app_installsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: app_installsInclude<ExtArgs> | null
    /**
     * Filter which app_installs to delete.
     */
    where: app_installsWhereUniqueInput
  }

  /**
   * app_installs deleteMany
   */
  export type app_installsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which app_installs to delete
     */
    where?: app_installsWhereInput
    /**
     * Limit how many app_installs to delete.
     */
    limit?: number
  }

  /**
   * app_installs.reminder_users
   */
  export type app_installs$reminder_usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersInclude<ExtArgs> | null
    where?: reminder_usersWhereInput
  }

  /**
   * app_installs without action
   */
  export type app_installsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the app_installs
     */
    select?: app_installsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the app_installs
     */
    omit?: app_installsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: app_installsInclude<ExtArgs> | null
  }


  /**
   * Model reminder_content
   */

  export type AggregateReminder_content = {
    _count: Reminder_contentCountAggregateOutputType | null
    _min: Reminder_contentMinAggregateOutputType | null
    _max: Reminder_contentMaxAggregateOutputType | null
  }

  export type Reminder_contentMinAggregateOutputType = {
    id: string | null
    reminder_user_id: string | null
    title: string | null
    description: string | null
    remind_at: Date | null
    status: $Enums.ReminderStatus | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Reminder_contentMaxAggregateOutputType = {
    id: string | null
    reminder_user_id: string | null
    title: string | null
    description: string | null
    remind_at: Date | null
    status: $Enums.ReminderStatus | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Reminder_contentCountAggregateOutputType = {
    id: number
    reminder_user_id: number
    title: number
    description: number
    remind_at: number
    status: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type Reminder_contentMinAggregateInputType = {
    id?: true
    reminder_user_id?: true
    title?: true
    description?: true
    remind_at?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type Reminder_contentMaxAggregateInputType = {
    id?: true
    reminder_user_id?: true
    title?: true
    description?: true
    remind_at?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type Reminder_contentCountAggregateInputType = {
    id?: true
    reminder_user_id?: true
    title?: true
    description?: true
    remind_at?: true
    status?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type Reminder_contentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which reminder_content to aggregate.
     */
    where?: reminder_contentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reminder_contents to fetch.
     */
    orderBy?: reminder_contentOrderByWithRelationInput | reminder_contentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: reminder_contentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reminder_contents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reminder_contents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned reminder_contents
    **/
    _count?: true | Reminder_contentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Reminder_contentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Reminder_contentMaxAggregateInputType
  }

  export type GetReminder_contentAggregateType<T extends Reminder_contentAggregateArgs> = {
        [P in keyof T & keyof AggregateReminder_content]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReminder_content[P]>
      : GetScalarType<T[P], AggregateReminder_content[P]>
  }




  export type reminder_contentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: reminder_contentWhereInput
    orderBy?: reminder_contentOrderByWithAggregationInput | reminder_contentOrderByWithAggregationInput[]
    by: Reminder_contentScalarFieldEnum[] | Reminder_contentScalarFieldEnum
    having?: reminder_contentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Reminder_contentCountAggregateInputType | true
    _min?: Reminder_contentMinAggregateInputType
    _max?: Reminder_contentMaxAggregateInputType
  }

  export type Reminder_contentGroupByOutputType = {
    id: string
    reminder_user_id: string
    title: string
    description: string | null
    remind_at: Date
    status: $Enums.ReminderStatus
    created_at: Date
    updated_at: Date
    _count: Reminder_contentCountAggregateOutputType | null
    _min: Reminder_contentMinAggregateOutputType | null
    _max: Reminder_contentMaxAggregateOutputType | null
  }

  type GetReminder_contentGroupByPayload<T extends reminder_contentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Reminder_contentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Reminder_contentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Reminder_contentGroupByOutputType[P]>
            : GetScalarType<T[P], Reminder_contentGroupByOutputType[P]>
        }
      >
    >


  export type reminder_contentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reminder_user_id?: boolean
    title?: boolean
    description?: boolean
    remind_at?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
    reminder_users?: boolean | reminder_usersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reminder_content"]>

  export type reminder_contentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reminder_user_id?: boolean
    title?: boolean
    description?: boolean
    remind_at?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
    reminder_users?: boolean | reminder_usersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reminder_content"]>

  export type reminder_contentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reminder_user_id?: boolean
    title?: boolean
    description?: boolean
    remind_at?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
    reminder_users?: boolean | reminder_usersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reminder_content"]>

  export type reminder_contentSelectScalar = {
    id?: boolean
    reminder_user_id?: boolean
    title?: boolean
    description?: boolean
    remind_at?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type reminder_contentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "reminder_user_id" | "title" | "description" | "remind_at" | "status" | "created_at" | "updated_at", ExtArgs["result"]["reminder_content"]>
  export type reminder_contentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reminder_users?: boolean | reminder_usersDefaultArgs<ExtArgs>
  }
  export type reminder_contentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reminder_users?: boolean | reminder_usersDefaultArgs<ExtArgs>
  }
  export type reminder_contentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reminder_users?: boolean | reminder_usersDefaultArgs<ExtArgs>
  }

  export type $reminder_contentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "reminder_content"
    objects: {
      reminder_users: Prisma.$reminder_usersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      reminder_user_id: string
      title: string
      description: string | null
      remind_at: Date
      status: $Enums.ReminderStatus
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["reminder_content"]>
    composites: {}
  }

  type reminder_contentGetPayload<S extends boolean | null | undefined | reminder_contentDefaultArgs> = $Result.GetResult<Prisma.$reminder_contentPayload, S>

  type reminder_contentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<reminder_contentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Reminder_contentCountAggregateInputType | true
    }

  export interface reminder_contentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['reminder_content'], meta: { name: 'reminder_content' } }
    /**
     * Find zero or one Reminder_content that matches the filter.
     * @param {reminder_contentFindUniqueArgs} args - Arguments to find a Reminder_content
     * @example
     * // Get one Reminder_content
     * const reminder_content = await prisma.reminder_content.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends reminder_contentFindUniqueArgs>(args: SelectSubset<T, reminder_contentFindUniqueArgs<ExtArgs>>): Prisma__reminder_contentClient<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Reminder_content that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {reminder_contentFindUniqueOrThrowArgs} args - Arguments to find a Reminder_content
     * @example
     * // Get one Reminder_content
     * const reminder_content = await prisma.reminder_content.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends reminder_contentFindUniqueOrThrowArgs>(args: SelectSubset<T, reminder_contentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__reminder_contentClient<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Reminder_content that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_contentFindFirstArgs} args - Arguments to find a Reminder_content
     * @example
     * // Get one Reminder_content
     * const reminder_content = await prisma.reminder_content.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends reminder_contentFindFirstArgs>(args?: SelectSubset<T, reminder_contentFindFirstArgs<ExtArgs>>): Prisma__reminder_contentClient<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Reminder_content that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_contentFindFirstOrThrowArgs} args - Arguments to find a Reminder_content
     * @example
     * // Get one Reminder_content
     * const reminder_content = await prisma.reminder_content.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends reminder_contentFindFirstOrThrowArgs>(args?: SelectSubset<T, reminder_contentFindFirstOrThrowArgs<ExtArgs>>): Prisma__reminder_contentClient<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Reminder_contents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_contentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Reminder_contents
     * const reminder_contents = await prisma.reminder_content.findMany()
     * 
     * // Get first 10 Reminder_contents
     * const reminder_contents = await prisma.reminder_content.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reminder_contentWithIdOnly = await prisma.reminder_content.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends reminder_contentFindManyArgs>(args?: SelectSubset<T, reminder_contentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Reminder_content.
     * @param {reminder_contentCreateArgs} args - Arguments to create a Reminder_content.
     * @example
     * // Create one Reminder_content
     * const Reminder_content = await prisma.reminder_content.create({
     *   data: {
     *     // ... data to create a Reminder_content
     *   }
     * })
     * 
     */
    create<T extends reminder_contentCreateArgs>(args: SelectSubset<T, reminder_contentCreateArgs<ExtArgs>>): Prisma__reminder_contentClient<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Reminder_contents.
     * @param {reminder_contentCreateManyArgs} args - Arguments to create many Reminder_contents.
     * @example
     * // Create many Reminder_contents
     * const reminder_content = await prisma.reminder_content.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends reminder_contentCreateManyArgs>(args?: SelectSubset<T, reminder_contentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Reminder_contents and returns the data saved in the database.
     * @param {reminder_contentCreateManyAndReturnArgs} args - Arguments to create many Reminder_contents.
     * @example
     * // Create many Reminder_contents
     * const reminder_content = await prisma.reminder_content.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Reminder_contents and only return the `id`
     * const reminder_contentWithIdOnly = await prisma.reminder_content.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends reminder_contentCreateManyAndReturnArgs>(args?: SelectSubset<T, reminder_contentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Reminder_content.
     * @param {reminder_contentDeleteArgs} args - Arguments to delete one Reminder_content.
     * @example
     * // Delete one Reminder_content
     * const Reminder_content = await prisma.reminder_content.delete({
     *   where: {
     *     // ... filter to delete one Reminder_content
     *   }
     * })
     * 
     */
    delete<T extends reminder_contentDeleteArgs>(args: SelectSubset<T, reminder_contentDeleteArgs<ExtArgs>>): Prisma__reminder_contentClient<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Reminder_content.
     * @param {reminder_contentUpdateArgs} args - Arguments to update one Reminder_content.
     * @example
     * // Update one Reminder_content
     * const reminder_content = await prisma.reminder_content.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends reminder_contentUpdateArgs>(args: SelectSubset<T, reminder_contentUpdateArgs<ExtArgs>>): Prisma__reminder_contentClient<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Reminder_contents.
     * @param {reminder_contentDeleteManyArgs} args - Arguments to filter Reminder_contents to delete.
     * @example
     * // Delete a few Reminder_contents
     * const { count } = await prisma.reminder_content.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends reminder_contentDeleteManyArgs>(args?: SelectSubset<T, reminder_contentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reminder_contents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_contentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Reminder_contents
     * const reminder_content = await prisma.reminder_content.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends reminder_contentUpdateManyArgs>(args: SelectSubset<T, reminder_contentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reminder_contents and returns the data updated in the database.
     * @param {reminder_contentUpdateManyAndReturnArgs} args - Arguments to update many Reminder_contents.
     * @example
     * // Update many Reminder_contents
     * const reminder_content = await prisma.reminder_content.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Reminder_contents and only return the `id`
     * const reminder_contentWithIdOnly = await prisma.reminder_content.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends reminder_contentUpdateManyAndReturnArgs>(args: SelectSubset<T, reminder_contentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Reminder_content.
     * @param {reminder_contentUpsertArgs} args - Arguments to update or create a Reminder_content.
     * @example
     * // Update or create a Reminder_content
     * const reminder_content = await prisma.reminder_content.upsert({
     *   create: {
     *     // ... data to create a Reminder_content
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Reminder_content we want to update
     *   }
     * })
     */
    upsert<T extends reminder_contentUpsertArgs>(args: SelectSubset<T, reminder_contentUpsertArgs<ExtArgs>>): Prisma__reminder_contentClient<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Reminder_contents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_contentCountArgs} args - Arguments to filter Reminder_contents to count.
     * @example
     * // Count the number of Reminder_contents
     * const count = await prisma.reminder_content.count({
     *   where: {
     *     // ... the filter for the Reminder_contents we want to count
     *   }
     * })
    **/
    count<T extends reminder_contentCountArgs>(
      args?: Subset<T, reminder_contentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Reminder_contentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Reminder_content.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Reminder_contentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Reminder_contentAggregateArgs>(args: Subset<T, Reminder_contentAggregateArgs>): Prisma.PrismaPromise<GetReminder_contentAggregateType<T>>

    /**
     * Group by Reminder_content.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_contentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends reminder_contentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: reminder_contentGroupByArgs['orderBy'] }
        : { orderBy?: reminder_contentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, reminder_contentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReminder_contentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the reminder_content model
   */
  readonly fields: reminder_contentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for reminder_content.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__reminder_contentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    reminder_users<T extends reminder_usersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, reminder_usersDefaultArgs<ExtArgs>>): Prisma__reminder_usersClient<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the reminder_content model
   */
  interface reminder_contentFieldRefs {
    readonly id: FieldRef<"reminder_content", 'String'>
    readonly reminder_user_id: FieldRef<"reminder_content", 'String'>
    readonly title: FieldRef<"reminder_content", 'String'>
    readonly description: FieldRef<"reminder_content", 'String'>
    readonly remind_at: FieldRef<"reminder_content", 'DateTime'>
    readonly status: FieldRef<"reminder_content", 'ReminderStatus'>
    readonly created_at: FieldRef<"reminder_content", 'DateTime'>
    readonly updated_at: FieldRef<"reminder_content", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * reminder_content findUnique
   */
  export type reminder_contentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentInclude<ExtArgs> | null
    /**
     * Filter, which reminder_content to fetch.
     */
    where: reminder_contentWhereUniqueInput
  }

  /**
   * reminder_content findUniqueOrThrow
   */
  export type reminder_contentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentInclude<ExtArgs> | null
    /**
     * Filter, which reminder_content to fetch.
     */
    where: reminder_contentWhereUniqueInput
  }

  /**
   * reminder_content findFirst
   */
  export type reminder_contentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentInclude<ExtArgs> | null
    /**
     * Filter, which reminder_content to fetch.
     */
    where?: reminder_contentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reminder_contents to fetch.
     */
    orderBy?: reminder_contentOrderByWithRelationInput | reminder_contentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for reminder_contents.
     */
    cursor?: reminder_contentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reminder_contents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reminder_contents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of reminder_contents.
     */
    distinct?: Reminder_contentScalarFieldEnum | Reminder_contentScalarFieldEnum[]
  }

  /**
   * reminder_content findFirstOrThrow
   */
  export type reminder_contentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentInclude<ExtArgs> | null
    /**
     * Filter, which reminder_content to fetch.
     */
    where?: reminder_contentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reminder_contents to fetch.
     */
    orderBy?: reminder_contentOrderByWithRelationInput | reminder_contentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for reminder_contents.
     */
    cursor?: reminder_contentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reminder_contents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reminder_contents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of reminder_contents.
     */
    distinct?: Reminder_contentScalarFieldEnum | Reminder_contentScalarFieldEnum[]
  }

  /**
   * reminder_content findMany
   */
  export type reminder_contentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentInclude<ExtArgs> | null
    /**
     * Filter, which reminder_contents to fetch.
     */
    where?: reminder_contentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reminder_contents to fetch.
     */
    orderBy?: reminder_contentOrderByWithRelationInput | reminder_contentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing reminder_contents.
     */
    cursor?: reminder_contentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reminder_contents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reminder_contents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of reminder_contents.
     */
    distinct?: Reminder_contentScalarFieldEnum | Reminder_contentScalarFieldEnum[]
  }

  /**
   * reminder_content create
   */
  export type reminder_contentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentInclude<ExtArgs> | null
    /**
     * The data needed to create a reminder_content.
     */
    data: XOR<reminder_contentCreateInput, reminder_contentUncheckedCreateInput>
  }

  /**
   * reminder_content createMany
   */
  export type reminder_contentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many reminder_contents.
     */
    data: reminder_contentCreateManyInput | reminder_contentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * reminder_content createManyAndReturn
   */
  export type reminder_contentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * The data used to create many reminder_contents.
     */
    data: reminder_contentCreateManyInput | reminder_contentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * reminder_content update
   */
  export type reminder_contentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentInclude<ExtArgs> | null
    /**
     * The data needed to update a reminder_content.
     */
    data: XOR<reminder_contentUpdateInput, reminder_contentUncheckedUpdateInput>
    /**
     * Choose, which reminder_content to update.
     */
    where: reminder_contentWhereUniqueInput
  }

  /**
   * reminder_content updateMany
   */
  export type reminder_contentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update reminder_contents.
     */
    data: XOR<reminder_contentUpdateManyMutationInput, reminder_contentUncheckedUpdateManyInput>
    /**
     * Filter which reminder_contents to update
     */
    where?: reminder_contentWhereInput
    /**
     * Limit how many reminder_contents to update.
     */
    limit?: number
  }

  /**
   * reminder_content updateManyAndReturn
   */
  export type reminder_contentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * The data used to update reminder_contents.
     */
    data: XOR<reminder_contentUpdateManyMutationInput, reminder_contentUncheckedUpdateManyInput>
    /**
     * Filter which reminder_contents to update
     */
    where?: reminder_contentWhereInput
    /**
     * Limit how many reminder_contents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * reminder_content upsert
   */
  export type reminder_contentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentInclude<ExtArgs> | null
    /**
     * The filter to search for the reminder_content to update in case it exists.
     */
    where: reminder_contentWhereUniqueInput
    /**
     * In case the reminder_content found by the `where` argument doesn't exist, create a new reminder_content with this data.
     */
    create: XOR<reminder_contentCreateInput, reminder_contentUncheckedCreateInput>
    /**
     * In case the reminder_content was found with the provided `where` argument, update it with this data.
     */
    update: XOR<reminder_contentUpdateInput, reminder_contentUncheckedUpdateInput>
  }

  /**
   * reminder_content delete
   */
  export type reminder_contentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentInclude<ExtArgs> | null
    /**
     * Filter which reminder_content to delete.
     */
    where: reminder_contentWhereUniqueInput
  }

  /**
   * reminder_content deleteMany
   */
  export type reminder_contentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which reminder_contents to delete
     */
    where?: reminder_contentWhereInput
    /**
     * Limit how many reminder_contents to delete.
     */
    limit?: number
  }

  /**
   * reminder_content without action
   */
  export type reminder_contentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentInclude<ExtArgs> | null
  }


  /**
   * Model reminder_users
   */

  export type AggregateReminder_users = {
    _count: Reminder_usersCountAggregateOutputType | null
    _avg: Reminder_usersAvgAggregateOutputType | null
    _sum: Reminder_usersSumAggregateOutputType | null
    _min: Reminder_usersMinAggregateOutputType | null
    _max: Reminder_usersMaxAggregateOutputType | null
  }

  export type Reminder_usersAvgAggregateOutputType = {
    max_reminders: number | null
  }

  export type Reminder_usersSumAggregateOutputType = {
    max_reminders: number | null
  }

  export type Reminder_usersMinAggregateOutputType = {
    id: string | null
    user_id: string | null
    max_reminders: number | null
    created_at: Date | null
  }

  export type Reminder_usersMaxAggregateOutputType = {
    id: string | null
    user_id: string | null
    max_reminders: number | null
    created_at: Date | null
  }

  export type Reminder_usersCountAggregateOutputType = {
    id: number
    user_id: number
    max_reminders: number
    created_at: number
    _all: number
  }


  export type Reminder_usersAvgAggregateInputType = {
    max_reminders?: true
  }

  export type Reminder_usersSumAggregateInputType = {
    max_reminders?: true
  }

  export type Reminder_usersMinAggregateInputType = {
    id?: true
    user_id?: true
    max_reminders?: true
    created_at?: true
  }

  export type Reminder_usersMaxAggregateInputType = {
    id?: true
    user_id?: true
    max_reminders?: true
    created_at?: true
  }

  export type Reminder_usersCountAggregateInputType = {
    id?: true
    user_id?: true
    max_reminders?: true
    created_at?: true
    _all?: true
  }

  export type Reminder_usersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which reminder_users to aggregate.
     */
    where?: reminder_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reminder_users to fetch.
     */
    orderBy?: reminder_usersOrderByWithRelationInput | reminder_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: reminder_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reminder_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reminder_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned reminder_users
    **/
    _count?: true | Reminder_usersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Reminder_usersAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Reminder_usersSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Reminder_usersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Reminder_usersMaxAggregateInputType
  }

  export type GetReminder_usersAggregateType<T extends Reminder_usersAggregateArgs> = {
        [P in keyof T & keyof AggregateReminder_users]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReminder_users[P]>
      : GetScalarType<T[P], AggregateReminder_users[P]>
  }




  export type reminder_usersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: reminder_usersWhereInput
    orderBy?: reminder_usersOrderByWithAggregationInput | reminder_usersOrderByWithAggregationInput[]
    by: Reminder_usersScalarFieldEnum[] | Reminder_usersScalarFieldEnum
    having?: reminder_usersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Reminder_usersCountAggregateInputType | true
    _avg?: Reminder_usersAvgAggregateInputType
    _sum?: Reminder_usersSumAggregateInputType
    _min?: Reminder_usersMinAggregateInputType
    _max?: Reminder_usersMaxAggregateInputType
  }

  export type Reminder_usersGroupByOutputType = {
    id: string
    user_id: string
    max_reminders: number
    created_at: Date
    _count: Reminder_usersCountAggregateOutputType | null
    _avg: Reminder_usersAvgAggregateOutputType | null
    _sum: Reminder_usersSumAggregateOutputType | null
    _min: Reminder_usersMinAggregateOutputType | null
    _max: Reminder_usersMaxAggregateOutputType | null
  }

  type GetReminder_usersGroupByPayload<T extends reminder_usersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Reminder_usersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Reminder_usersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Reminder_usersGroupByOutputType[P]>
            : GetScalarType<T[P], Reminder_usersGroupByOutputType[P]>
        }
      >
    >


  export type reminder_usersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    max_reminders?: boolean
    created_at?: boolean
    reminder_content?: boolean | reminder_users$reminder_contentArgs<ExtArgs>
    app_installs?: boolean | app_installsDefaultArgs<ExtArgs>
    _count?: boolean | Reminder_usersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reminder_users"]>

  export type reminder_usersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    max_reminders?: boolean
    created_at?: boolean
    app_installs?: boolean | app_installsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reminder_users"]>

  export type reminder_usersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    max_reminders?: boolean
    created_at?: boolean
    app_installs?: boolean | app_installsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reminder_users"]>

  export type reminder_usersSelectScalar = {
    id?: boolean
    user_id?: boolean
    max_reminders?: boolean
    created_at?: boolean
  }

  export type reminder_usersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "user_id" | "max_reminders" | "created_at", ExtArgs["result"]["reminder_users"]>
  export type reminder_usersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reminder_content?: boolean | reminder_users$reminder_contentArgs<ExtArgs>
    app_installs?: boolean | app_installsDefaultArgs<ExtArgs>
    _count?: boolean | Reminder_usersCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type reminder_usersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    app_installs?: boolean | app_installsDefaultArgs<ExtArgs>
  }
  export type reminder_usersIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    app_installs?: boolean | app_installsDefaultArgs<ExtArgs>
  }

  export type $reminder_usersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "reminder_users"
    objects: {
      reminder_content: Prisma.$reminder_contentPayload<ExtArgs>[]
      app_installs: Prisma.$app_installsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      user_id: string
      max_reminders: number
      created_at: Date
    }, ExtArgs["result"]["reminder_users"]>
    composites: {}
  }

  type reminder_usersGetPayload<S extends boolean | null | undefined | reminder_usersDefaultArgs> = $Result.GetResult<Prisma.$reminder_usersPayload, S>

  type reminder_usersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<reminder_usersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Reminder_usersCountAggregateInputType | true
    }

  export interface reminder_usersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['reminder_users'], meta: { name: 'reminder_users' } }
    /**
     * Find zero or one Reminder_users that matches the filter.
     * @param {reminder_usersFindUniqueArgs} args - Arguments to find a Reminder_users
     * @example
     * // Get one Reminder_users
     * const reminder_users = await prisma.reminder_users.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends reminder_usersFindUniqueArgs>(args: SelectSubset<T, reminder_usersFindUniqueArgs<ExtArgs>>): Prisma__reminder_usersClient<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Reminder_users that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {reminder_usersFindUniqueOrThrowArgs} args - Arguments to find a Reminder_users
     * @example
     * // Get one Reminder_users
     * const reminder_users = await prisma.reminder_users.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends reminder_usersFindUniqueOrThrowArgs>(args: SelectSubset<T, reminder_usersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__reminder_usersClient<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Reminder_users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_usersFindFirstArgs} args - Arguments to find a Reminder_users
     * @example
     * // Get one Reminder_users
     * const reminder_users = await prisma.reminder_users.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends reminder_usersFindFirstArgs>(args?: SelectSubset<T, reminder_usersFindFirstArgs<ExtArgs>>): Prisma__reminder_usersClient<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Reminder_users that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_usersFindFirstOrThrowArgs} args - Arguments to find a Reminder_users
     * @example
     * // Get one Reminder_users
     * const reminder_users = await prisma.reminder_users.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends reminder_usersFindFirstOrThrowArgs>(args?: SelectSubset<T, reminder_usersFindFirstOrThrowArgs<ExtArgs>>): Prisma__reminder_usersClient<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Reminder_users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_usersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Reminder_users
     * const reminder_users = await prisma.reminder_users.findMany()
     * 
     * // Get first 10 Reminder_users
     * const reminder_users = await prisma.reminder_users.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reminder_usersWithIdOnly = await prisma.reminder_users.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends reminder_usersFindManyArgs>(args?: SelectSubset<T, reminder_usersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Reminder_users.
     * @param {reminder_usersCreateArgs} args - Arguments to create a Reminder_users.
     * @example
     * // Create one Reminder_users
     * const Reminder_users = await prisma.reminder_users.create({
     *   data: {
     *     // ... data to create a Reminder_users
     *   }
     * })
     * 
     */
    create<T extends reminder_usersCreateArgs>(args: SelectSubset<T, reminder_usersCreateArgs<ExtArgs>>): Prisma__reminder_usersClient<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Reminder_users.
     * @param {reminder_usersCreateManyArgs} args - Arguments to create many Reminder_users.
     * @example
     * // Create many Reminder_users
     * const reminder_users = await prisma.reminder_users.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends reminder_usersCreateManyArgs>(args?: SelectSubset<T, reminder_usersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Reminder_users and returns the data saved in the database.
     * @param {reminder_usersCreateManyAndReturnArgs} args - Arguments to create many Reminder_users.
     * @example
     * // Create many Reminder_users
     * const reminder_users = await prisma.reminder_users.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Reminder_users and only return the `id`
     * const reminder_usersWithIdOnly = await prisma.reminder_users.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends reminder_usersCreateManyAndReturnArgs>(args?: SelectSubset<T, reminder_usersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Reminder_users.
     * @param {reminder_usersDeleteArgs} args - Arguments to delete one Reminder_users.
     * @example
     * // Delete one Reminder_users
     * const Reminder_users = await prisma.reminder_users.delete({
     *   where: {
     *     // ... filter to delete one Reminder_users
     *   }
     * })
     * 
     */
    delete<T extends reminder_usersDeleteArgs>(args: SelectSubset<T, reminder_usersDeleteArgs<ExtArgs>>): Prisma__reminder_usersClient<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Reminder_users.
     * @param {reminder_usersUpdateArgs} args - Arguments to update one Reminder_users.
     * @example
     * // Update one Reminder_users
     * const reminder_users = await prisma.reminder_users.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends reminder_usersUpdateArgs>(args: SelectSubset<T, reminder_usersUpdateArgs<ExtArgs>>): Prisma__reminder_usersClient<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Reminder_users.
     * @param {reminder_usersDeleteManyArgs} args - Arguments to filter Reminder_users to delete.
     * @example
     * // Delete a few Reminder_users
     * const { count } = await prisma.reminder_users.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends reminder_usersDeleteManyArgs>(args?: SelectSubset<T, reminder_usersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reminder_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_usersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Reminder_users
     * const reminder_users = await prisma.reminder_users.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends reminder_usersUpdateManyArgs>(args: SelectSubset<T, reminder_usersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reminder_users and returns the data updated in the database.
     * @param {reminder_usersUpdateManyAndReturnArgs} args - Arguments to update many Reminder_users.
     * @example
     * // Update many Reminder_users
     * const reminder_users = await prisma.reminder_users.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Reminder_users and only return the `id`
     * const reminder_usersWithIdOnly = await prisma.reminder_users.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends reminder_usersUpdateManyAndReturnArgs>(args: SelectSubset<T, reminder_usersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Reminder_users.
     * @param {reminder_usersUpsertArgs} args - Arguments to update or create a Reminder_users.
     * @example
     * // Update or create a Reminder_users
     * const reminder_users = await prisma.reminder_users.upsert({
     *   create: {
     *     // ... data to create a Reminder_users
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Reminder_users we want to update
     *   }
     * })
     */
    upsert<T extends reminder_usersUpsertArgs>(args: SelectSubset<T, reminder_usersUpsertArgs<ExtArgs>>): Prisma__reminder_usersClient<$Result.GetResult<Prisma.$reminder_usersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Reminder_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_usersCountArgs} args - Arguments to filter Reminder_users to count.
     * @example
     * // Count the number of Reminder_users
     * const count = await prisma.reminder_users.count({
     *   where: {
     *     // ... the filter for the Reminder_users we want to count
     *   }
     * })
    **/
    count<T extends reminder_usersCountArgs>(
      args?: Subset<T, reminder_usersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Reminder_usersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Reminder_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Reminder_usersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Reminder_usersAggregateArgs>(args: Subset<T, Reminder_usersAggregateArgs>): Prisma.PrismaPromise<GetReminder_usersAggregateType<T>>

    /**
     * Group by Reminder_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reminder_usersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends reminder_usersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: reminder_usersGroupByArgs['orderBy'] }
        : { orderBy?: reminder_usersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, reminder_usersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReminder_usersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the reminder_users model
   */
  readonly fields: reminder_usersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for reminder_users.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__reminder_usersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    reminder_content<T extends reminder_users$reminder_contentArgs<ExtArgs> = {}>(args?: Subset<T, reminder_users$reminder_contentArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$reminder_contentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    app_installs<T extends app_installsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, app_installsDefaultArgs<ExtArgs>>): Prisma__app_installsClient<$Result.GetResult<Prisma.$app_installsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the reminder_users model
   */
  interface reminder_usersFieldRefs {
    readonly id: FieldRef<"reminder_users", 'String'>
    readonly user_id: FieldRef<"reminder_users", 'String'>
    readonly max_reminders: FieldRef<"reminder_users", 'Int'>
    readonly created_at: FieldRef<"reminder_users", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * reminder_users findUnique
   */
  export type reminder_usersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersInclude<ExtArgs> | null
    /**
     * Filter, which reminder_users to fetch.
     */
    where: reminder_usersWhereUniqueInput
  }

  /**
   * reminder_users findUniqueOrThrow
   */
  export type reminder_usersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersInclude<ExtArgs> | null
    /**
     * Filter, which reminder_users to fetch.
     */
    where: reminder_usersWhereUniqueInput
  }

  /**
   * reminder_users findFirst
   */
  export type reminder_usersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersInclude<ExtArgs> | null
    /**
     * Filter, which reminder_users to fetch.
     */
    where?: reminder_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reminder_users to fetch.
     */
    orderBy?: reminder_usersOrderByWithRelationInput | reminder_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for reminder_users.
     */
    cursor?: reminder_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reminder_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reminder_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of reminder_users.
     */
    distinct?: Reminder_usersScalarFieldEnum | Reminder_usersScalarFieldEnum[]
  }

  /**
   * reminder_users findFirstOrThrow
   */
  export type reminder_usersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersInclude<ExtArgs> | null
    /**
     * Filter, which reminder_users to fetch.
     */
    where?: reminder_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reminder_users to fetch.
     */
    orderBy?: reminder_usersOrderByWithRelationInput | reminder_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for reminder_users.
     */
    cursor?: reminder_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reminder_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reminder_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of reminder_users.
     */
    distinct?: Reminder_usersScalarFieldEnum | Reminder_usersScalarFieldEnum[]
  }

  /**
   * reminder_users findMany
   */
  export type reminder_usersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersInclude<ExtArgs> | null
    /**
     * Filter, which reminder_users to fetch.
     */
    where?: reminder_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reminder_users to fetch.
     */
    orderBy?: reminder_usersOrderByWithRelationInput | reminder_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing reminder_users.
     */
    cursor?: reminder_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reminder_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reminder_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of reminder_users.
     */
    distinct?: Reminder_usersScalarFieldEnum | Reminder_usersScalarFieldEnum[]
  }

  /**
   * reminder_users create
   */
  export type reminder_usersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersInclude<ExtArgs> | null
    /**
     * The data needed to create a reminder_users.
     */
    data: XOR<reminder_usersCreateInput, reminder_usersUncheckedCreateInput>
  }

  /**
   * reminder_users createMany
   */
  export type reminder_usersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many reminder_users.
     */
    data: reminder_usersCreateManyInput | reminder_usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * reminder_users createManyAndReturn
   */
  export type reminder_usersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * The data used to create many reminder_users.
     */
    data: reminder_usersCreateManyInput | reminder_usersCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * reminder_users update
   */
  export type reminder_usersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersInclude<ExtArgs> | null
    /**
     * The data needed to update a reminder_users.
     */
    data: XOR<reminder_usersUpdateInput, reminder_usersUncheckedUpdateInput>
    /**
     * Choose, which reminder_users to update.
     */
    where: reminder_usersWhereUniqueInput
  }

  /**
   * reminder_users updateMany
   */
  export type reminder_usersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update reminder_users.
     */
    data: XOR<reminder_usersUpdateManyMutationInput, reminder_usersUncheckedUpdateManyInput>
    /**
     * Filter which reminder_users to update
     */
    where?: reminder_usersWhereInput
    /**
     * Limit how many reminder_users to update.
     */
    limit?: number
  }

  /**
   * reminder_users updateManyAndReturn
   */
  export type reminder_usersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * The data used to update reminder_users.
     */
    data: XOR<reminder_usersUpdateManyMutationInput, reminder_usersUncheckedUpdateManyInput>
    /**
     * Filter which reminder_users to update
     */
    where?: reminder_usersWhereInput
    /**
     * Limit how many reminder_users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * reminder_users upsert
   */
  export type reminder_usersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersInclude<ExtArgs> | null
    /**
     * The filter to search for the reminder_users to update in case it exists.
     */
    where: reminder_usersWhereUniqueInput
    /**
     * In case the reminder_users found by the `where` argument doesn't exist, create a new reminder_users with this data.
     */
    create: XOR<reminder_usersCreateInput, reminder_usersUncheckedCreateInput>
    /**
     * In case the reminder_users was found with the provided `where` argument, update it with this data.
     */
    update: XOR<reminder_usersUpdateInput, reminder_usersUncheckedUpdateInput>
  }

  /**
   * reminder_users delete
   */
  export type reminder_usersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersInclude<ExtArgs> | null
    /**
     * Filter which reminder_users to delete.
     */
    where: reminder_usersWhereUniqueInput
  }

  /**
   * reminder_users deleteMany
   */
  export type reminder_usersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which reminder_users to delete
     */
    where?: reminder_usersWhereInput
    /**
     * Limit how many reminder_users to delete.
     */
    limit?: number
  }

  /**
   * reminder_users.reminder_content
   */
  export type reminder_users$reminder_contentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_content
     */
    select?: reminder_contentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_content
     */
    omit?: reminder_contentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_contentInclude<ExtArgs> | null
    where?: reminder_contentWhereInput
    orderBy?: reminder_contentOrderByWithRelationInput | reminder_contentOrderByWithRelationInput[]
    cursor?: reminder_contentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Reminder_contentScalarFieldEnum | Reminder_contentScalarFieldEnum[]
  }

  /**
   * reminder_users without action
   */
  export type reminder_usersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reminder_users
     */
    select?: reminder_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the reminder_users
     */
    omit?: reminder_usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: reminder_usersInclude<ExtArgs> | null
  }


  /**
   * Model users
   */

  export type AggregateUsers = {
    _count: UsersCountAggregateOutputType | null
    _avg: UsersAvgAggregateOutputType | null
    _sum: UsersSumAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  export type UsersAvgAggregateOutputType = {
    login_count: number | null
  }

  export type UsersSumAggregateOutputType = {
    login_count: number | null
  }

  export type UsersMinAggregateOutputType = {
    id: string | null
    external_id: string | null
    created_at: Date | null
    last_login_at: Date | null
    login_count: number | null
  }

  export type UsersMaxAggregateOutputType = {
    id: string | null
    external_id: string | null
    created_at: Date | null
    last_login_at: Date | null
    login_count: number | null
  }

  export type UsersCountAggregateOutputType = {
    id: number
    external_id: number
    created_at: number
    last_login_at: number
    login_count: number
    _all: number
  }


  export type UsersAvgAggregateInputType = {
    login_count?: true
  }

  export type UsersSumAggregateInputType = {
    login_count?: true
  }

  export type UsersMinAggregateInputType = {
    id?: true
    external_id?: true
    created_at?: true
    last_login_at?: true
    login_count?: true
  }

  export type UsersMaxAggregateInputType = {
    id?: true
    external_id?: true
    created_at?: true
    last_login_at?: true
    login_count?: true
  }

  export type UsersCountAggregateInputType = {
    id?: true
    external_id?: true
    created_at?: true
    last_login_at?: true
    login_count?: true
    _all?: true
  }

  export type UsersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to aggregate.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned users
    **/
    _count?: true | UsersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UsersAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UsersSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsersMaxAggregateInputType
  }

  export type GetUsersAggregateType<T extends UsersAggregateArgs> = {
        [P in keyof T & keyof AggregateUsers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsers[P]>
      : GetScalarType<T[P], AggregateUsers[P]>
  }




  export type usersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: usersWhereInput
    orderBy?: usersOrderByWithAggregationInput | usersOrderByWithAggregationInput[]
    by: UsersScalarFieldEnum[] | UsersScalarFieldEnum
    having?: usersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsersCountAggregateInputType | true
    _avg?: UsersAvgAggregateInputType
    _sum?: UsersSumAggregateInputType
    _min?: UsersMinAggregateInputType
    _max?: UsersMaxAggregateInputType
  }

  export type UsersGroupByOutputType = {
    id: string
    external_id: string
    created_at: Date
    last_login_at: Date
    login_count: number | null
    _count: UsersCountAggregateOutputType | null
    _avg: UsersAvgAggregateOutputType | null
    _sum: UsersSumAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  type GetUsersGroupByPayload<T extends usersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsersGroupByOutputType[P]>
            : GetScalarType<T[P], UsersGroupByOutputType[P]>
        }
      >
    >


  export type usersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    external_id?: boolean
    created_at?: boolean
    last_login_at?: boolean
    login_count?: boolean
  }, ExtArgs["result"]["users"]>

  export type usersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    external_id?: boolean
    created_at?: boolean
    last_login_at?: boolean
    login_count?: boolean
  }, ExtArgs["result"]["users"]>

  export type usersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    external_id?: boolean
    created_at?: boolean
    last_login_at?: boolean
    login_count?: boolean
  }, ExtArgs["result"]["users"]>

  export type usersSelectScalar = {
    id?: boolean
    external_id?: boolean
    created_at?: boolean
    last_login_at?: boolean
    login_count?: boolean
  }

  export type usersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "external_id" | "created_at" | "last_login_at" | "login_count", ExtArgs["result"]["users"]>

  export type $usersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "users"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      external_id: string
      created_at: Date
      last_login_at: Date
      login_count: number | null
    }, ExtArgs["result"]["users"]>
    composites: {}
  }

  type usersGetPayload<S extends boolean | null | undefined | usersDefaultArgs> = $Result.GetResult<Prisma.$usersPayload, S>

  type usersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<usersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsersCountAggregateInputType | true
    }

  export interface usersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['users'], meta: { name: 'users' } }
    /**
     * Find zero or one Users that matches the filter.
     * @param {usersFindUniqueArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends usersFindUniqueArgs>(args: SelectSubset<T, usersFindUniqueArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Users that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {usersFindUniqueOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends usersFindUniqueOrThrowArgs>(args: SelectSubset<T, usersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindFirstArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends usersFindFirstArgs>(args?: SelectSubset<T, usersFindFirstArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindFirstOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends usersFindFirstOrThrowArgs>(args?: SelectSubset<T, usersFindFirstOrThrowArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.users.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.users.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usersWithIdOnly = await prisma.users.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends usersFindManyArgs>(args?: SelectSubset<T, usersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Users.
     * @param {usersCreateArgs} args - Arguments to create a Users.
     * @example
     * // Create one Users
     * const Users = await prisma.users.create({
     *   data: {
     *     // ... data to create a Users
     *   }
     * })
     * 
     */
    create<T extends usersCreateArgs>(args: SelectSubset<T, usersCreateArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {usersCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends usersCreateManyArgs>(args?: SelectSubset<T, usersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {usersCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const usersWithIdOnly = await prisma.users.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends usersCreateManyAndReturnArgs>(args?: SelectSubset<T, usersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Users.
     * @param {usersDeleteArgs} args - Arguments to delete one Users.
     * @example
     * // Delete one Users
     * const Users = await prisma.users.delete({
     *   where: {
     *     // ... filter to delete one Users
     *   }
     * })
     * 
     */
    delete<T extends usersDeleteArgs>(args: SelectSubset<T, usersDeleteArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Users.
     * @param {usersUpdateArgs} args - Arguments to update one Users.
     * @example
     * // Update one Users
     * const users = await prisma.users.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends usersUpdateArgs>(args: SelectSubset<T, usersUpdateArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {usersDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.users.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends usersDeleteManyArgs>(args?: SelectSubset<T, usersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends usersUpdateManyArgs>(args: SelectSubset<T, usersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {usersUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const usersWithIdOnly = await prisma.users.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends usersUpdateManyAndReturnArgs>(args: SelectSubset<T, usersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Users.
     * @param {usersUpsertArgs} args - Arguments to update or create a Users.
     * @example
     * // Update or create a Users
     * const users = await prisma.users.upsert({
     *   create: {
     *     // ... data to create a Users
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Users we want to update
     *   }
     * })
     */
    upsert<T extends usersUpsertArgs>(args: SelectSubset<T, usersUpsertArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.users.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends usersCountArgs>(
      args?: Subset<T, usersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsersAggregateArgs>(args: Subset<T, UsersAggregateArgs>): Prisma.PrismaPromise<GetUsersAggregateType<T>>

    /**
     * Group by Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends usersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: usersGroupByArgs['orderBy'] }
        : { orderBy?: usersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, usersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the users model
   */
  readonly fields: usersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for users.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__usersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the users model
   */
  interface usersFieldRefs {
    readonly id: FieldRef<"users", 'String'>
    readonly external_id: FieldRef<"users", 'String'>
    readonly created_at: FieldRef<"users", 'DateTime'>
    readonly last_login_at: FieldRef<"users", 'DateTime'>
    readonly login_count: FieldRef<"users", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * users findUnique
   */
  export type usersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users findUniqueOrThrow
   */
  export type usersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users findFirst
   */
  export type usersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users findFirstOrThrow
   */
  export type usersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users findMany
   */
  export type usersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users create
   */
  export type usersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * The data needed to create a users.
     */
    data: XOR<usersCreateInput, usersUncheckedCreateInput>
  }

  /**
   * users createMany
   */
  export type usersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many users.
     */
    data: usersCreateManyInput | usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * users createManyAndReturn
   */
  export type usersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * The data used to create many users.
     */
    data: usersCreateManyInput | usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * users update
   */
  export type usersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * The data needed to update a users.
     */
    data: XOR<usersUpdateInput, usersUncheckedUpdateInput>
    /**
     * Choose, which users to update.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users updateMany
   */
  export type usersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update users.
     */
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: usersWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
  }

  /**
   * users updateManyAndReturn
   */
  export type usersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * The data used to update users.
     */
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: usersWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
  }

  /**
   * users upsert
   */
  export type usersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * The filter to search for the users to update in case it exists.
     */
    where: usersWhereUniqueInput
    /**
     * In case the users found by the `where` argument doesn't exist, create a new users with this data.
     */
    create: XOR<usersCreateInput, usersUncheckedCreateInput>
    /**
     * In case the users was found with the provided `where` argument, update it with this data.
     */
    update: XOR<usersUpdateInput, usersUncheckedUpdateInput>
  }

  /**
   * users delete
   */
  export type usersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Filter which users to delete.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users deleteMany
   */
  export type usersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to delete
     */
    where?: usersWhereInput
    /**
     * Limit how many users to delete.
     */
    limit?: number
  }

  /**
   * users without action
   */
  export type usersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
  }


  /**
   * Model Server
   */

  export type AggregateServer = {
    _count: ServerCountAggregateOutputType | null
    _avg: ServerAvgAggregateOutputType | null
    _sum: ServerSumAggregateOutputType | null
    _min: ServerMinAggregateOutputType | null
    _max: ServerMaxAggregateOutputType | null
  }

  export type ServerAvgAggregateOutputType = {
    weight: number | null
    priority: number | null
    requestsHandled: number | null
    activeRequests: number | null
    averageResponseTime: number | null
    failureCount: number | null
  }

  export type ServerSumAggregateOutputType = {
    weight: number | null
    priority: number | null
    requestsHandled: number | null
    activeRequests: number | null
    averageResponseTime: number | null
    failureCount: number | null
  }

  export type ServerMinAggregateOutputType = {
    id: string | null
    name: string | null
    url: string | null
    enabled: boolean | null
    healthy: $Enums.ServerHealth | null
    weight: number | null
    priority: number | null
    requestsHandled: number | null
    activeRequests: number | null
    lastHealthCheck: Date | null
    averageResponseTime: number | null
    failureCount: number | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ServerMaxAggregateOutputType = {
    id: string | null
    name: string | null
    url: string | null
    enabled: boolean | null
    healthy: $Enums.ServerHealth | null
    weight: number | null
    priority: number | null
    requestsHandled: number | null
    activeRequests: number | null
    lastHealthCheck: Date | null
    averageResponseTime: number | null
    failureCount: number | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ServerCountAggregateOutputType = {
    id: number
    name: number
    url: number
    enabled: number
    healthy: number
    weight: number
    priority: number
    requestsHandled: number
    activeRequests: number
    lastHealthCheck: number
    averageResponseTime: number
    failureCount: number
    deletedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ServerAvgAggregateInputType = {
    weight?: true
    priority?: true
    requestsHandled?: true
    activeRequests?: true
    averageResponseTime?: true
    failureCount?: true
  }

  export type ServerSumAggregateInputType = {
    weight?: true
    priority?: true
    requestsHandled?: true
    activeRequests?: true
    averageResponseTime?: true
    failureCount?: true
  }

  export type ServerMinAggregateInputType = {
    id?: true
    name?: true
    url?: true
    enabled?: true
    healthy?: true
    weight?: true
    priority?: true
    requestsHandled?: true
    activeRequests?: true
    lastHealthCheck?: true
    averageResponseTime?: true
    failureCount?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ServerMaxAggregateInputType = {
    id?: true
    name?: true
    url?: true
    enabled?: true
    healthy?: true
    weight?: true
    priority?: true
    requestsHandled?: true
    activeRequests?: true
    lastHealthCheck?: true
    averageResponseTime?: true
    failureCount?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ServerCountAggregateInputType = {
    id?: true
    name?: true
    url?: true
    enabled?: true
    healthy?: true
    weight?: true
    priority?: true
    requestsHandled?: true
    activeRequests?: true
    lastHealthCheck?: true
    averageResponseTime?: true
    failureCount?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ServerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Server to aggregate.
     */
    where?: ServerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Servers to fetch.
     */
    orderBy?: ServerOrderByWithRelationInput | ServerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ServerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Servers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Servers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Servers
    **/
    _count?: true | ServerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ServerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ServerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ServerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ServerMaxAggregateInputType
  }

  export type GetServerAggregateType<T extends ServerAggregateArgs> = {
        [P in keyof T & keyof AggregateServer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateServer[P]>
      : GetScalarType<T[P], AggregateServer[P]>
  }




  export type ServerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServerWhereInput
    orderBy?: ServerOrderByWithAggregationInput | ServerOrderByWithAggregationInput[]
    by: ServerScalarFieldEnum[] | ServerScalarFieldEnum
    having?: ServerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ServerCountAggregateInputType | true
    _avg?: ServerAvgAggregateInputType
    _sum?: ServerSumAggregateInputType
    _min?: ServerMinAggregateInputType
    _max?: ServerMaxAggregateInputType
  }

  export type ServerGroupByOutputType = {
    id: string
    name: string
    url: string
    enabled: boolean
    healthy: $Enums.ServerHealth
    weight: number
    priority: number
    requestsHandled: number
    activeRequests: number
    lastHealthCheck: Date | null
    averageResponseTime: number
    failureCount: number
    deletedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: ServerCountAggregateOutputType | null
    _avg: ServerAvgAggregateOutputType | null
    _sum: ServerSumAggregateOutputType | null
    _min: ServerMinAggregateOutputType | null
    _max: ServerMaxAggregateOutputType | null
  }

  type GetServerGroupByPayload<T extends ServerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ServerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ServerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServerGroupByOutputType[P]>
            : GetScalarType<T[P], ServerGroupByOutputType[P]>
        }
      >
    >


  export type ServerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    url?: boolean
    enabled?: boolean
    healthy?: boolean
    weight?: boolean
    priority?: boolean
    requestsHandled?: boolean
    activeRequests?: boolean
    lastHealthCheck?: boolean
    averageResponseTime?: boolean
    failureCount?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["server"]>

  export type ServerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    url?: boolean
    enabled?: boolean
    healthy?: boolean
    weight?: boolean
    priority?: boolean
    requestsHandled?: boolean
    activeRequests?: boolean
    lastHealthCheck?: boolean
    averageResponseTime?: boolean
    failureCount?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["server"]>

  export type ServerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    url?: boolean
    enabled?: boolean
    healthy?: boolean
    weight?: boolean
    priority?: boolean
    requestsHandled?: boolean
    activeRequests?: boolean
    lastHealthCheck?: boolean
    averageResponseTime?: boolean
    failureCount?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["server"]>

  export type ServerSelectScalar = {
    id?: boolean
    name?: boolean
    url?: boolean
    enabled?: boolean
    healthy?: boolean
    weight?: boolean
    priority?: boolean
    requestsHandled?: boolean
    activeRequests?: boolean
    lastHealthCheck?: boolean
    averageResponseTime?: boolean
    failureCount?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ServerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "url" | "enabled" | "healthy" | "weight" | "priority" | "requestsHandled" | "activeRequests" | "lastHealthCheck" | "averageResponseTime" | "failureCount" | "deletedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["server"]>

  export type $ServerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Server"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      url: string
      enabled: boolean
      healthy: $Enums.ServerHealth
      weight: number
      priority: number
      requestsHandled: number
      activeRequests: number
      lastHealthCheck: Date | null
      averageResponseTime: number
      failureCount: number
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["server"]>
    composites: {}
  }

  type ServerGetPayload<S extends boolean | null | undefined | ServerDefaultArgs> = $Result.GetResult<Prisma.$ServerPayload, S>

  type ServerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ServerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ServerCountAggregateInputType | true
    }

  export interface ServerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Server'], meta: { name: 'Server' } }
    /**
     * Find zero or one Server that matches the filter.
     * @param {ServerFindUniqueArgs} args - Arguments to find a Server
     * @example
     * // Get one Server
     * const server = await prisma.server.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServerFindUniqueArgs>(args: SelectSubset<T, ServerFindUniqueArgs<ExtArgs>>): Prisma__ServerClient<$Result.GetResult<Prisma.$ServerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Server that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ServerFindUniqueOrThrowArgs} args - Arguments to find a Server
     * @example
     * // Get one Server
     * const server = await prisma.server.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServerFindUniqueOrThrowArgs>(args: SelectSubset<T, ServerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ServerClient<$Result.GetResult<Prisma.$ServerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Server that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerFindFirstArgs} args - Arguments to find a Server
     * @example
     * // Get one Server
     * const server = await prisma.server.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServerFindFirstArgs>(args?: SelectSubset<T, ServerFindFirstArgs<ExtArgs>>): Prisma__ServerClient<$Result.GetResult<Prisma.$ServerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Server that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerFindFirstOrThrowArgs} args - Arguments to find a Server
     * @example
     * // Get one Server
     * const server = await prisma.server.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServerFindFirstOrThrowArgs>(args?: SelectSubset<T, ServerFindFirstOrThrowArgs<ExtArgs>>): Prisma__ServerClient<$Result.GetResult<Prisma.$ServerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Servers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Servers
     * const servers = await prisma.server.findMany()
     * 
     * // Get first 10 Servers
     * const servers = await prisma.server.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const serverWithIdOnly = await prisma.server.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ServerFindManyArgs>(args?: SelectSubset<T, ServerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Server.
     * @param {ServerCreateArgs} args - Arguments to create a Server.
     * @example
     * // Create one Server
     * const Server = await prisma.server.create({
     *   data: {
     *     // ... data to create a Server
     *   }
     * })
     * 
     */
    create<T extends ServerCreateArgs>(args: SelectSubset<T, ServerCreateArgs<ExtArgs>>): Prisma__ServerClient<$Result.GetResult<Prisma.$ServerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Servers.
     * @param {ServerCreateManyArgs} args - Arguments to create many Servers.
     * @example
     * // Create many Servers
     * const server = await prisma.server.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ServerCreateManyArgs>(args?: SelectSubset<T, ServerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Servers and returns the data saved in the database.
     * @param {ServerCreateManyAndReturnArgs} args - Arguments to create many Servers.
     * @example
     * // Create many Servers
     * const server = await prisma.server.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Servers and only return the `id`
     * const serverWithIdOnly = await prisma.server.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ServerCreateManyAndReturnArgs>(args?: SelectSubset<T, ServerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Server.
     * @param {ServerDeleteArgs} args - Arguments to delete one Server.
     * @example
     * // Delete one Server
     * const Server = await prisma.server.delete({
     *   where: {
     *     // ... filter to delete one Server
     *   }
     * })
     * 
     */
    delete<T extends ServerDeleteArgs>(args: SelectSubset<T, ServerDeleteArgs<ExtArgs>>): Prisma__ServerClient<$Result.GetResult<Prisma.$ServerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Server.
     * @param {ServerUpdateArgs} args - Arguments to update one Server.
     * @example
     * // Update one Server
     * const server = await prisma.server.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ServerUpdateArgs>(args: SelectSubset<T, ServerUpdateArgs<ExtArgs>>): Prisma__ServerClient<$Result.GetResult<Prisma.$ServerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Servers.
     * @param {ServerDeleteManyArgs} args - Arguments to filter Servers to delete.
     * @example
     * // Delete a few Servers
     * const { count } = await prisma.server.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ServerDeleteManyArgs>(args?: SelectSubset<T, ServerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Servers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Servers
     * const server = await prisma.server.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ServerUpdateManyArgs>(args: SelectSubset<T, ServerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Servers and returns the data updated in the database.
     * @param {ServerUpdateManyAndReturnArgs} args - Arguments to update many Servers.
     * @example
     * // Update many Servers
     * const server = await prisma.server.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Servers and only return the `id`
     * const serverWithIdOnly = await prisma.server.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ServerUpdateManyAndReturnArgs>(args: SelectSubset<T, ServerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Server.
     * @param {ServerUpsertArgs} args - Arguments to update or create a Server.
     * @example
     * // Update or create a Server
     * const server = await prisma.server.upsert({
     *   create: {
     *     // ... data to create a Server
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Server we want to update
     *   }
     * })
     */
    upsert<T extends ServerUpsertArgs>(args: SelectSubset<T, ServerUpsertArgs<ExtArgs>>): Prisma__ServerClient<$Result.GetResult<Prisma.$ServerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Servers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerCountArgs} args - Arguments to filter Servers to count.
     * @example
     * // Count the number of Servers
     * const count = await prisma.server.count({
     *   where: {
     *     // ... the filter for the Servers we want to count
     *   }
     * })
    **/
    count<T extends ServerCountArgs>(
      args?: Subset<T, ServerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ServerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Server.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ServerAggregateArgs>(args: Subset<T, ServerAggregateArgs>): Prisma.PrismaPromise<GetServerAggregateType<T>>

    /**
     * Group by Server.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ServerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServerGroupByArgs['orderBy'] }
        : { orderBy?: ServerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ServerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Server model
   */
  readonly fields: ServerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Server.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Server model
   */
  interface ServerFieldRefs {
    readonly id: FieldRef<"Server", 'String'>
    readonly name: FieldRef<"Server", 'String'>
    readonly url: FieldRef<"Server", 'String'>
    readonly enabled: FieldRef<"Server", 'Boolean'>
    readonly healthy: FieldRef<"Server", 'ServerHealth'>
    readonly weight: FieldRef<"Server", 'Int'>
    readonly priority: FieldRef<"Server", 'Int'>
    readonly requestsHandled: FieldRef<"Server", 'Int'>
    readonly activeRequests: FieldRef<"Server", 'Int'>
    readonly lastHealthCheck: FieldRef<"Server", 'DateTime'>
    readonly averageResponseTime: FieldRef<"Server", 'Float'>
    readonly failureCount: FieldRef<"Server", 'Int'>
    readonly deletedAt: FieldRef<"Server", 'DateTime'>
    readonly createdAt: FieldRef<"Server", 'DateTime'>
    readonly updatedAt: FieldRef<"Server", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Server findUnique
   */
  export type ServerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
    /**
     * Filter, which Server to fetch.
     */
    where: ServerWhereUniqueInput
  }

  /**
   * Server findUniqueOrThrow
   */
  export type ServerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
    /**
     * Filter, which Server to fetch.
     */
    where: ServerWhereUniqueInput
  }

  /**
   * Server findFirst
   */
  export type ServerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
    /**
     * Filter, which Server to fetch.
     */
    where?: ServerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Servers to fetch.
     */
    orderBy?: ServerOrderByWithRelationInput | ServerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Servers.
     */
    cursor?: ServerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Servers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Servers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Servers.
     */
    distinct?: ServerScalarFieldEnum | ServerScalarFieldEnum[]
  }

  /**
   * Server findFirstOrThrow
   */
  export type ServerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
    /**
     * Filter, which Server to fetch.
     */
    where?: ServerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Servers to fetch.
     */
    orderBy?: ServerOrderByWithRelationInput | ServerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Servers.
     */
    cursor?: ServerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Servers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Servers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Servers.
     */
    distinct?: ServerScalarFieldEnum | ServerScalarFieldEnum[]
  }

  /**
   * Server findMany
   */
  export type ServerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
    /**
     * Filter, which Servers to fetch.
     */
    where?: ServerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Servers to fetch.
     */
    orderBy?: ServerOrderByWithRelationInput | ServerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Servers.
     */
    cursor?: ServerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Servers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Servers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Servers.
     */
    distinct?: ServerScalarFieldEnum | ServerScalarFieldEnum[]
  }

  /**
   * Server create
   */
  export type ServerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
    /**
     * The data needed to create a Server.
     */
    data: XOR<ServerCreateInput, ServerUncheckedCreateInput>
  }

  /**
   * Server createMany
   */
  export type ServerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Servers.
     */
    data: ServerCreateManyInput | ServerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Server createManyAndReturn
   */
  export type ServerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
    /**
     * The data used to create many Servers.
     */
    data: ServerCreateManyInput | ServerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Server update
   */
  export type ServerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
    /**
     * The data needed to update a Server.
     */
    data: XOR<ServerUpdateInput, ServerUncheckedUpdateInput>
    /**
     * Choose, which Server to update.
     */
    where: ServerWhereUniqueInput
  }

  /**
   * Server updateMany
   */
  export type ServerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Servers.
     */
    data: XOR<ServerUpdateManyMutationInput, ServerUncheckedUpdateManyInput>
    /**
     * Filter which Servers to update
     */
    where?: ServerWhereInput
    /**
     * Limit how many Servers to update.
     */
    limit?: number
  }

  /**
   * Server updateManyAndReturn
   */
  export type ServerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
    /**
     * The data used to update Servers.
     */
    data: XOR<ServerUpdateManyMutationInput, ServerUncheckedUpdateManyInput>
    /**
     * Filter which Servers to update
     */
    where?: ServerWhereInput
    /**
     * Limit how many Servers to update.
     */
    limit?: number
  }

  /**
   * Server upsert
   */
  export type ServerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
    /**
     * The filter to search for the Server to update in case it exists.
     */
    where: ServerWhereUniqueInput
    /**
     * In case the Server found by the `where` argument doesn't exist, create a new Server with this data.
     */
    create: XOR<ServerCreateInput, ServerUncheckedCreateInput>
    /**
     * In case the Server was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ServerUpdateInput, ServerUncheckedUpdateInput>
  }

  /**
   * Server delete
   */
  export type ServerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
    /**
     * Filter which Server to delete.
     */
    where: ServerWhereUniqueInput
  }

  /**
   * Server deleteMany
   */
  export type ServerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Servers to delete
     */
    where?: ServerWhereInput
    /**
     * Limit how many Servers to delete.
     */
    limit?: number
  }

  /**
   * Server without action
   */
  export type ServerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Server
     */
    select?: ServerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Server
     */
    omit?: ServerOmit<ExtArgs> | null
  }


  /**
   * Model Settings
   */

  export type AggregateSettings = {
    _count: SettingsCountAggregateOutputType | null
    _avg: SettingsAvgAggregateOutputType | null
    _sum: SettingsSumAggregateOutputType | null
    _min: SettingsMinAggregateOutputType | null
    _max: SettingsMaxAggregateOutputType | null
  }

  export type SettingsAvgAggregateOutputType = {
    healthCheckInterval: number | null
    healthCheckTimeout: number | null
    maxFailures: number | null
    requestTimeout: number | null
    maxRetries: number | null
  }

  export type SettingsSumAggregateOutputType = {
    healthCheckInterval: number | null
    healthCheckTimeout: number | null
    maxFailures: number | null
    requestTimeout: number | null
    maxRetries: number | null
  }

  export type SettingsMinAggregateOutputType = {
    id: string | null
    algorithm: $Enums.Algorithm | null
    healthCheckInterval: number | null
    healthCheckTimeout: number | null
    maxFailures: number | null
    autoRecovery: boolean | null
    requestTimeout: number | null
    maxRetries: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SettingsMaxAggregateOutputType = {
    id: string | null
    algorithm: $Enums.Algorithm | null
    healthCheckInterval: number | null
    healthCheckTimeout: number | null
    maxFailures: number | null
    autoRecovery: boolean | null
    requestTimeout: number | null
    maxRetries: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SettingsCountAggregateOutputType = {
    id: number
    algorithm: number
    healthCheckInterval: number
    healthCheckTimeout: number
    maxFailures: number
    autoRecovery: number
    requestTimeout: number
    maxRetries: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SettingsAvgAggregateInputType = {
    healthCheckInterval?: true
    healthCheckTimeout?: true
    maxFailures?: true
    requestTimeout?: true
    maxRetries?: true
  }

  export type SettingsSumAggregateInputType = {
    healthCheckInterval?: true
    healthCheckTimeout?: true
    maxFailures?: true
    requestTimeout?: true
    maxRetries?: true
  }

  export type SettingsMinAggregateInputType = {
    id?: true
    algorithm?: true
    healthCheckInterval?: true
    healthCheckTimeout?: true
    maxFailures?: true
    autoRecovery?: true
    requestTimeout?: true
    maxRetries?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SettingsMaxAggregateInputType = {
    id?: true
    algorithm?: true
    healthCheckInterval?: true
    healthCheckTimeout?: true
    maxFailures?: true
    autoRecovery?: true
    requestTimeout?: true
    maxRetries?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SettingsCountAggregateInputType = {
    id?: true
    algorithm?: true
    healthCheckInterval?: true
    healthCheckTimeout?: true
    maxFailures?: true
    autoRecovery?: true
    requestTimeout?: true
    maxRetries?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Settings to aggregate.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Settings
    **/
    _count?: true | SettingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SettingsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SettingsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SettingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SettingsMaxAggregateInputType
  }

  export type GetSettingsAggregateType<T extends SettingsAggregateArgs> = {
        [P in keyof T & keyof AggregateSettings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSettings[P]>
      : GetScalarType<T[P], AggregateSettings[P]>
  }




  export type SettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SettingsWhereInput
    orderBy?: SettingsOrderByWithAggregationInput | SettingsOrderByWithAggregationInput[]
    by: SettingsScalarFieldEnum[] | SettingsScalarFieldEnum
    having?: SettingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SettingsCountAggregateInputType | true
    _avg?: SettingsAvgAggregateInputType
    _sum?: SettingsSumAggregateInputType
    _min?: SettingsMinAggregateInputType
    _max?: SettingsMaxAggregateInputType
  }

  export type SettingsGroupByOutputType = {
    id: string
    algorithm: $Enums.Algorithm
    healthCheckInterval: number
    healthCheckTimeout: number
    maxFailures: number
    autoRecovery: boolean
    requestTimeout: number
    maxRetries: number
    createdAt: Date
    updatedAt: Date
    _count: SettingsCountAggregateOutputType | null
    _avg: SettingsAvgAggregateOutputType | null
    _sum: SettingsSumAggregateOutputType | null
    _min: SettingsMinAggregateOutputType | null
    _max: SettingsMaxAggregateOutputType | null
  }

  type GetSettingsGroupByPayload<T extends SettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SettingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SettingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SettingsGroupByOutputType[P]>
            : GetScalarType<T[P], SettingsGroupByOutputType[P]>
        }
      >
    >


  export type SettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    algorithm?: boolean
    healthCheckInterval?: boolean
    healthCheckTimeout?: boolean
    maxFailures?: boolean
    autoRecovery?: boolean
    requestTimeout?: boolean
    maxRetries?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    algorithm?: boolean
    healthCheckInterval?: boolean
    healthCheckTimeout?: boolean
    maxFailures?: boolean
    autoRecovery?: boolean
    requestTimeout?: boolean
    maxRetries?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    algorithm?: boolean
    healthCheckInterval?: boolean
    healthCheckTimeout?: boolean
    maxFailures?: boolean
    autoRecovery?: boolean
    requestTimeout?: boolean
    maxRetries?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectScalar = {
    id?: boolean
    algorithm?: boolean
    healthCheckInterval?: boolean
    healthCheckTimeout?: boolean
    maxFailures?: boolean
    autoRecovery?: boolean
    requestTimeout?: boolean
    maxRetries?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SettingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "algorithm" | "healthCheckInterval" | "healthCheckTimeout" | "maxFailures" | "autoRecovery" | "requestTimeout" | "maxRetries" | "createdAt" | "updatedAt", ExtArgs["result"]["settings"]>

  export type $SettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Settings"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      algorithm: $Enums.Algorithm
      healthCheckInterval: number
      healthCheckTimeout: number
      maxFailures: number
      autoRecovery: boolean
      requestTimeout: number
      maxRetries: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["settings"]>
    composites: {}
  }

  type SettingsGetPayload<S extends boolean | null | undefined | SettingsDefaultArgs> = $Result.GetResult<Prisma.$SettingsPayload, S>

  type SettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SettingsCountAggregateInputType | true
    }

  export interface SettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Settings'], meta: { name: 'Settings' } }
    /**
     * Find zero or one Settings that matches the filter.
     * @param {SettingsFindUniqueArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SettingsFindUniqueArgs>(args: SelectSubset<T, SettingsFindUniqueArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Settings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SettingsFindUniqueOrThrowArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SettingsFindUniqueOrThrowArgs>(args: SelectSubset<T, SettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindFirstArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SettingsFindFirstArgs>(args?: SelectSubset<T, SettingsFindFirstArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Settings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindFirstOrThrowArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SettingsFindFirstOrThrowArgs>(args?: SelectSubset<T, SettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Settings
     * const settings = await prisma.settings.findMany()
     * 
     * // Get first 10 Settings
     * const settings = await prisma.settings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const settingsWithIdOnly = await prisma.settings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SettingsFindManyArgs>(args?: SelectSubset<T, SettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Settings.
     * @param {SettingsCreateArgs} args - Arguments to create a Settings.
     * @example
     * // Create one Settings
     * const Settings = await prisma.settings.create({
     *   data: {
     *     // ... data to create a Settings
     *   }
     * })
     * 
     */
    create<T extends SettingsCreateArgs>(args: SelectSubset<T, SettingsCreateArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Settings.
     * @param {SettingsCreateManyArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const settings = await prisma.settings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SettingsCreateManyArgs>(args?: SelectSubset<T, SettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Settings and returns the data saved in the database.
     * @param {SettingsCreateManyAndReturnArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const settings = await prisma.settings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Settings and only return the `id`
     * const settingsWithIdOnly = await prisma.settings.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SettingsCreateManyAndReturnArgs>(args?: SelectSubset<T, SettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Settings.
     * @param {SettingsDeleteArgs} args - Arguments to delete one Settings.
     * @example
     * // Delete one Settings
     * const Settings = await prisma.settings.delete({
     *   where: {
     *     // ... filter to delete one Settings
     *   }
     * })
     * 
     */
    delete<T extends SettingsDeleteArgs>(args: SelectSubset<T, SettingsDeleteArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Settings.
     * @param {SettingsUpdateArgs} args - Arguments to update one Settings.
     * @example
     * // Update one Settings
     * const settings = await prisma.settings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SettingsUpdateArgs>(args: SelectSubset<T, SettingsUpdateArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Settings.
     * @param {SettingsDeleteManyArgs} args - Arguments to filter Settings to delete.
     * @example
     * // Delete a few Settings
     * const { count } = await prisma.settings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SettingsDeleteManyArgs>(args?: SelectSubset<T, SettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Settings
     * const settings = await prisma.settings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SettingsUpdateManyArgs>(args: SelectSubset<T, SettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settings and returns the data updated in the database.
     * @param {SettingsUpdateManyAndReturnArgs} args - Arguments to update many Settings.
     * @example
     * // Update many Settings
     * const settings = await prisma.settings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Settings and only return the `id`
     * const settingsWithIdOnly = await prisma.settings.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SettingsUpdateManyAndReturnArgs>(args: SelectSubset<T, SettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Settings.
     * @param {SettingsUpsertArgs} args - Arguments to update or create a Settings.
     * @example
     * // Update or create a Settings
     * const settings = await prisma.settings.upsert({
     *   create: {
     *     // ... data to create a Settings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Settings we want to update
     *   }
     * })
     */
    upsert<T extends SettingsUpsertArgs>(args: SelectSubset<T, SettingsUpsertArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsCountArgs} args - Arguments to filter Settings to count.
     * @example
     * // Count the number of Settings
     * const count = await prisma.settings.count({
     *   where: {
     *     // ... the filter for the Settings we want to count
     *   }
     * })
    **/
    count<T extends SettingsCountArgs>(
      args?: Subset<T, SettingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SettingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SettingsAggregateArgs>(args: Subset<T, SettingsAggregateArgs>): Prisma.PrismaPromise<GetSettingsAggregateType<T>>

    /**
     * Group by Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SettingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SettingsGroupByArgs['orderBy'] }
        : { orderBy?: SettingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Settings model
   */
  readonly fields: SettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Settings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SettingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Settings model
   */
  interface SettingsFieldRefs {
    readonly id: FieldRef<"Settings", 'String'>
    readonly algorithm: FieldRef<"Settings", 'Algorithm'>
    readonly healthCheckInterval: FieldRef<"Settings", 'Int'>
    readonly healthCheckTimeout: FieldRef<"Settings", 'Int'>
    readonly maxFailures: FieldRef<"Settings", 'Int'>
    readonly autoRecovery: FieldRef<"Settings", 'Boolean'>
    readonly requestTimeout: FieldRef<"Settings", 'Int'>
    readonly maxRetries: FieldRef<"Settings", 'Int'>
    readonly createdAt: FieldRef<"Settings", 'DateTime'>
    readonly updatedAt: FieldRef<"Settings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Settings findUnique
   */
  export type SettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings findUniqueOrThrow
   */
  export type SettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings findFirst
   */
  export type SettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings findFirstOrThrow
   */
  export type SettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings findMany
   */
  export type SettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings create
   */
  export type SettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data needed to create a Settings.
     */
    data: XOR<SettingsCreateInput, SettingsUncheckedCreateInput>
  }

  /**
   * Settings createMany
   */
  export type SettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Settings.
     */
    data: SettingsCreateManyInput | SettingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Settings createManyAndReturn
   */
  export type SettingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data used to create many Settings.
     */
    data: SettingsCreateManyInput | SettingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Settings update
   */
  export type SettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data needed to update a Settings.
     */
    data: XOR<SettingsUpdateInput, SettingsUncheckedUpdateInput>
    /**
     * Choose, which Settings to update.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings updateMany
   */
  export type SettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingsUpdateManyMutationInput, SettingsUncheckedUpdateManyInput>
    /**
     * Filter which Settings to update
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to update.
     */
    limit?: number
  }

  /**
   * Settings updateManyAndReturn
   */
  export type SettingsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingsUpdateManyMutationInput, SettingsUncheckedUpdateManyInput>
    /**
     * Filter which Settings to update
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to update.
     */
    limit?: number
  }

  /**
   * Settings upsert
   */
  export type SettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The filter to search for the Settings to update in case it exists.
     */
    where: SettingsWhereUniqueInput
    /**
     * In case the Settings found by the `where` argument doesn't exist, create a new Settings with this data.
     */
    create: XOR<SettingsCreateInput, SettingsUncheckedCreateInput>
    /**
     * In case the Settings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SettingsUpdateInput, SettingsUncheckedUpdateInput>
  }

  /**
   * Settings delete
   */
  export type SettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter which Settings to delete.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings deleteMany
   */
  export type SettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Settings to delete
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to delete.
     */
    limit?: number
  }

  /**
   * Settings without action
   */
  export type SettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
  }


  /**
   * Model RequestLog
   */

  export type AggregateRequestLog = {
    _count: RequestLogCountAggregateOutputType | null
    _avg: RequestLogAvgAggregateOutputType | null
    _sum: RequestLogSumAggregateOutputType | null
    _min: RequestLogMinAggregateOutputType | null
    _max: RequestLogMaxAggregateOutputType | null
  }

  export type RequestLogAvgAggregateOutputType = {
    statusCode: number | null
    responseTimeMs: number | null
    retryCount: number | null
  }

  export type RequestLogSumAggregateOutputType = {
    statusCode: number | null
    responseTimeMs: number | null
    retryCount: number | null
  }

  export type RequestLogMinAggregateOutputType = {
    id: string | null
    requestId: string | null
    method: $Enums.HttpMethod | null
    route: string | null
    backendId: string | null
    backendUrl: string | null
    statusCode: number | null
    responseTimeMs: number | null
    retryCount: number | null
    errorMessage: string | null
    createdAt: Date | null
  }

  export type RequestLogMaxAggregateOutputType = {
    id: string | null
    requestId: string | null
    method: $Enums.HttpMethod | null
    route: string | null
    backendId: string | null
    backendUrl: string | null
    statusCode: number | null
    responseTimeMs: number | null
    retryCount: number | null
    errorMessage: string | null
    createdAt: Date | null
  }

  export type RequestLogCountAggregateOutputType = {
    id: number
    requestId: number
    method: number
    route: number
    backendId: number
    backendUrl: number
    statusCode: number
    responseTimeMs: number
    retryCount: number
    errorMessage: number
    createdAt: number
    _all: number
  }


  export type RequestLogAvgAggregateInputType = {
    statusCode?: true
    responseTimeMs?: true
    retryCount?: true
  }

  export type RequestLogSumAggregateInputType = {
    statusCode?: true
    responseTimeMs?: true
    retryCount?: true
  }

  export type RequestLogMinAggregateInputType = {
    id?: true
    requestId?: true
    method?: true
    route?: true
    backendId?: true
    backendUrl?: true
    statusCode?: true
    responseTimeMs?: true
    retryCount?: true
    errorMessage?: true
    createdAt?: true
  }

  export type RequestLogMaxAggregateInputType = {
    id?: true
    requestId?: true
    method?: true
    route?: true
    backendId?: true
    backendUrl?: true
    statusCode?: true
    responseTimeMs?: true
    retryCount?: true
    errorMessage?: true
    createdAt?: true
  }

  export type RequestLogCountAggregateInputType = {
    id?: true
    requestId?: true
    method?: true
    route?: true
    backendId?: true
    backendUrl?: true
    statusCode?: true
    responseTimeMs?: true
    retryCount?: true
    errorMessage?: true
    createdAt?: true
    _all?: true
  }

  export type RequestLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestLog to aggregate.
     */
    where?: RequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestLogs to fetch.
     */
    orderBy?: RequestLogOrderByWithRelationInput | RequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RequestLogs
    **/
    _count?: true | RequestLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RequestLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RequestLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RequestLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RequestLogMaxAggregateInputType
  }

  export type GetRequestLogAggregateType<T extends RequestLogAggregateArgs> = {
        [P in keyof T & keyof AggregateRequestLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRequestLog[P]>
      : GetScalarType<T[P], AggregateRequestLog[P]>
  }




  export type RequestLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestLogWhereInput
    orderBy?: RequestLogOrderByWithAggregationInput | RequestLogOrderByWithAggregationInput[]
    by: RequestLogScalarFieldEnum[] | RequestLogScalarFieldEnum
    having?: RequestLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RequestLogCountAggregateInputType | true
    _avg?: RequestLogAvgAggregateInputType
    _sum?: RequestLogSumAggregateInputType
    _min?: RequestLogMinAggregateInputType
    _max?: RequestLogMaxAggregateInputType
  }

  export type RequestLogGroupByOutputType = {
    id: string
    requestId: string
    method: $Enums.HttpMethod
    route: string
    backendId: string | null
    backendUrl: string | null
    statusCode: number | null
    responseTimeMs: number | null
    retryCount: number
    errorMessage: string | null
    createdAt: Date
    _count: RequestLogCountAggregateOutputType | null
    _avg: RequestLogAvgAggregateOutputType | null
    _sum: RequestLogSumAggregateOutputType | null
    _min: RequestLogMinAggregateOutputType | null
    _max: RequestLogMaxAggregateOutputType | null
  }

  type GetRequestLogGroupByPayload<T extends RequestLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RequestLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RequestLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RequestLogGroupByOutputType[P]>
            : GetScalarType<T[P], RequestLogGroupByOutputType[P]>
        }
      >
    >


  export type RequestLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    method?: boolean
    route?: boolean
    backendId?: boolean
    backendUrl?: boolean
    statusCode?: boolean
    responseTimeMs?: boolean
    retryCount?: boolean
    errorMessage?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["requestLog"]>

  export type RequestLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    method?: boolean
    route?: boolean
    backendId?: boolean
    backendUrl?: boolean
    statusCode?: boolean
    responseTimeMs?: boolean
    retryCount?: boolean
    errorMessage?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["requestLog"]>

  export type RequestLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    method?: boolean
    route?: boolean
    backendId?: boolean
    backendUrl?: boolean
    statusCode?: boolean
    responseTimeMs?: boolean
    retryCount?: boolean
    errorMessage?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["requestLog"]>

  export type RequestLogSelectScalar = {
    id?: boolean
    requestId?: boolean
    method?: boolean
    route?: boolean
    backendId?: boolean
    backendUrl?: boolean
    statusCode?: boolean
    responseTimeMs?: boolean
    retryCount?: boolean
    errorMessage?: boolean
    createdAt?: boolean
  }

  export type RequestLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "requestId" | "method" | "route" | "backendId" | "backendUrl" | "statusCode" | "responseTimeMs" | "retryCount" | "errorMessage" | "createdAt", ExtArgs["result"]["requestLog"]>

  export type $RequestLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RequestLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      requestId: string
      method: $Enums.HttpMethod
      route: string
      backendId: string | null
      backendUrl: string | null
      statusCode: number | null
      responseTimeMs: number | null
      retryCount: number
      errorMessage: string | null
      createdAt: Date
    }, ExtArgs["result"]["requestLog"]>
    composites: {}
  }

  type RequestLogGetPayload<S extends boolean | null | undefined | RequestLogDefaultArgs> = $Result.GetResult<Prisma.$RequestLogPayload, S>

  type RequestLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RequestLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RequestLogCountAggregateInputType | true
    }

  export interface RequestLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RequestLog'], meta: { name: 'RequestLog' } }
    /**
     * Find zero or one RequestLog that matches the filter.
     * @param {RequestLogFindUniqueArgs} args - Arguments to find a RequestLog
     * @example
     * // Get one RequestLog
     * const requestLog = await prisma.requestLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RequestLogFindUniqueArgs>(args: SelectSubset<T, RequestLogFindUniqueArgs<ExtArgs>>): Prisma__RequestLogClient<$Result.GetResult<Prisma.$RequestLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RequestLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RequestLogFindUniqueOrThrowArgs} args - Arguments to find a RequestLog
     * @example
     * // Get one RequestLog
     * const requestLog = await prisma.requestLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RequestLogFindUniqueOrThrowArgs>(args: SelectSubset<T, RequestLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RequestLogClient<$Result.GetResult<Prisma.$RequestLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RequestLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestLogFindFirstArgs} args - Arguments to find a RequestLog
     * @example
     * // Get one RequestLog
     * const requestLog = await prisma.requestLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RequestLogFindFirstArgs>(args?: SelectSubset<T, RequestLogFindFirstArgs<ExtArgs>>): Prisma__RequestLogClient<$Result.GetResult<Prisma.$RequestLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RequestLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestLogFindFirstOrThrowArgs} args - Arguments to find a RequestLog
     * @example
     * // Get one RequestLog
     * const requestLog = await prisma.requestLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RequestLogFindFirstOrThrowArgs>(args?: SelectSubset<T, RequestLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__RequestLogClient<$Result.GetResult<Prisma.$RequestLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RequestLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RequestLogs
     * const requestLogs = await prisma.requestLog.findMany()
     * 
     * // Get first 10 RequestLogs
     * const requestLogs = await prisma.requestLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const requestLogWithIdOnly = await prisma.requestLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RequestLogFindManyArgs>(args?: SelectSubset<T, RequestLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RequestLog.
     * @param {RequestLogCreateArgs} args - Arguments to create a RequestLog.
     * @example
     * // Create one RequestLog
     * const RequestLog = await prisma.requestLog.create({
     *   data: {
     *     // ... data to create a RequestLog
     *   }
     * })
     * 
     */
    create<T extends RequestLogCreateArgs>(args: SelectSubset<T, RequestLogCreateArgs<ExtArgs>>): Prisma__RequestLogClient<$Result.GetResult<Prisma.$RequestLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RequestLogs.
     * @param {RequestLogCreateManyArgs} args - Arguments to create many RequestLogs.
     * @example
     * // Create many RequestLogs
     * const requestLog = await prisma.requestLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RequestLogCreateManyArgs>(args?: SelectSubset<T, RequestLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RequestLogs and returns the data saved in the database.
     * @param {RequestLogCreateManyAndReturnArgs} args - Arguments to create many RequestLogs.
     * @example
     * // Create many RequestLogs
     * const requestLog = await prisma.requestLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RequestLogs and only return the `id`
     * const requestLogWithIdOnly = await prisma.requestLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RequestLogCreateManyAndReturnArgs>(args?: SelectSubset<T, RequestLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RequestLog.
     * @param {RequestLogDeleteArgs} args - Arguments to delete one RequestLog.
     * @example
     * // Delete one RequestLog
     * const RequestLog = await prisma.requestLog.delete({
     *   where: {
     *     // ... filter to delete one RequestLog
     *   }
     * })
     * 
     */
    delete<T extends RequestLogDeleteArgs>(args: SelectSubset<T, RequestLogDeleteArgs<ExtArgs>>): Prisma__RequestLogClient<$Result.GetResult<Prisma.$RequestLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RequestLog.
     * @param {RequestLogUpdateArgs} args - Arguments to update one RequestLog.
     * @example
     * // Update one RequestLog
     * const requestLog = await prisma.requestLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RequestLogUpdateArgs>(args: SelectSubset<T, RequestLogUpdateArgs<ExtArgs>>): Prisma__RequestLogClient<$Result.GetResult<Prisma.$RequestLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RequestLogs.
     * @param {RequestLogDeleteManyArgs} args - Arguments to filter RequestLogs to delete.
     * @example
     * // Delete a few RequestLogs
     * const { count } = await prisma.requestLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RequestLogDeleteManyArgs>(args?: SelectSubset<T, RequestLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RequestLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RequestLogs
     * const requestLog = await prisma.requestLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RequestLogUpdateManyArgs>(args: SelectSubset<T, RequestLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RequestLogs and returns the data updated in the database.
     * @param {RequestLogUpdateManyAndReturnArgs} args - Arguments to update many RequestLogs.
     * @example
     * // Update many RequestLogs
     * const requestLog = await prisma.requestLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RequestLogs and only return the `id`
     * const requestLogWithIdOnly = await prisma.requestLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RequestLogUpdateManyAndReturnArgs>(args: SelectSubset<T, RequestLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RequestLog.
     * @param {RequestLogUpsertArgs} args - Arguments to update or create a RequestLog.
     * @example
     * // Update or create a RequestLog
     * const requestLog = await prisma.requestLog.upsert({
     *   create: {
     *     // ... data to create a RequestLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RequestLog we want to update
     *   }
     * })
     */
    upsert<T extends RequestLogUpsertArgs>(args: SelectSubset<T, RequestLogUpsertArgs<ExtArgs>>): Prisma__RequestLogClient<$Result.GetResult<Prisma.$RequestLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RequestLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestLogCountArgs} args - Arguments to filter RequestLogs to count.
     * @example
     * // Count the number of RequestLogs
     * const count = await prisma.requestLog.count({
     *   where: {
     *     // ... the filter for the RequestLogs we want to count
     *   }
     * })
    **/
    count<T extends RequestLogCountArgs>(
      args?: Subset<T, RequestLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RequestLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RequestLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RequestLogAggregateArgs>(args: Subset<T, RequestLogAggregateArgs>): Prisma.PrismaPromise<GetRequestLogAggregateType<T>>

    /**
     * Group by RequestLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RequestLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RequestLogGroupByArgs['orderBy'] }
        : { orderBy?: RequestLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RequestLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequestLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RequestLog model
   */
  readonly fields: RequestLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RequestLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RequestLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RequestLog model
   */
  interface RequestLogFieldRefs {
    readonly id: FieldRef<"RequestLog", 'String'>
    readonly requestId: FieldRef<"RequestLog", 'String'>
    readonly method: FieldRef<"RequestLog", 'HttpMethod'>
    readonly route: FieldRef<"RequestLog", 'String'>
    readonly backendId: FieldRef<"RequestLog", 'String'>
    readonly backendUrl: FieldRef<"RequestLog", 'String'>
    readonly statusCode: FieldRef<"RequestLog", 'Int'>
    readonly responseTimeMs: FieldRef<"RequestLog", 'Int'>
    readonly retryCount: FieldRef<"RequestLog", 'Int'>
    readonly errorMessage: FieldRef<"RequestLog", 'String'>
    readonly createdAt: FieldRef<"RequestLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RequestLog findUnique
   */
  export type RequestLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
    /**
     * Filter, which RequestLog to fetch.
     */
    where: RequestLogWhereUniqueInput
  }

  /**
   * RequestLog findUniqueOrThrow
   */
  export type RequestLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
    /**
     * Filter, which RequestLog to fetch.
     */
    where: RequestLogWhereUniqueInput
  }

  /**
   * RequestLog findFirst
   */
  export type RequestLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
    /**
     * Filter, which RequestLog to fetch.
     */
    where?: RequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestLogs to fetch.
     */
    orderBy?: RequestLogOrderByWithRelationInput | RequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestLogs.
     */
    cursor?: RequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestLogs.
     */
    distinct?: RequestLogScalarFieldEnum | RequestLogScalarFieldEnum[]
  }

  /**
   * RequestLog findFirstOrThrow
   */
  export type RequestLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
    /**
     * Filter, which RequestLog to fetch.
     */
    where?: RequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestLogs to fetch.
     */
    orderBy?: RequestLogOrderByWithRelationInput | RequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestLogs.
     */
    cursor?: RequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestLogs.
     */
    distinct?: RequestLogScalarFieldEnum | RequestLogScalarFieldEnum[]
  }

  /**
   * RequestLog findMany
   */
  export type RequestLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
    /**
     * Filter, which RequestLogs to fetch.
     */
    where?: RequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestLogs to fetch.
     */
    orderBy?: RequestLogOrderByWithRelationInput | RequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RequestLogs.
     */
    cursor?: RequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestLogs.
     */
    distinct?: RequestLogScalarFieldEnum | RequestLogScalarFieldEnum[]
  }

  /**
   * RequestLog create
   */
  export type RequestLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
    /**
     * The data needed to create a RequestLog.
     */
    data: XOR<RequestLogCreateInput, RequestLogUncheckedCreateInput>
  }

  /**
   * RequestLog createMany
   */
  export type RequestLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RequestLogs.
     */
    data: RequestLogCreateManyInput | RequestLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RequestLog createManyAndReturn
   */
  export type RequestLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
    /**
     * The data used to create many RequestLogs.
     */
    data: RequestLogCreateManyInput | RequestLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RequestLog update
   */
  export type RequestLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
    /**
     * The data needed to update a RequestLog.
     */
    data: XOR<RequestLogUpdateInput, RequestLogUncheckedUpdateInput>
    /**
     * Choose, which RequestLog to update.
     */
    where: RequestLogWhereUniqueInput
  }

  /**
   * RequestLog updateMany
   */
  export type RequestLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RequestLogs.
     */
    data: XOR<RequestLogUpdateManyMutationInput, RequestLogUncheckedUpdateManyInput>
    /**
     * Filter which RequestLogs to update
     */
    where?: RequestLogWhereInput
    /**
     * Limit how many RequestLogs to update.
     */
    limit?: number
  }

  /**
   * RequestLog updateManyAndReturn
   */
  export type RequestLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
    /**
     * The data used to update RequestLogs.
     */
    data: XOR<RequestLogUpdateManyMutationInput, RequestLogUncheckedUpdateManyInput>
    /**
     * Filter which RequestLogs to update
     */
    where?: RequestLogWhereInput
    /**
     * Limit how many RequestLogs to update.
     */
    limit?: number
  }

  /**
   * RequestLog upsert
   */
  export type RequestLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
    /**
     * The filter to search for the RequestLog to update in case it exists.
     */
    where: RequestLogWhereUniqueInput
    /**
     * In case the RequestLog found by the `where` argument doesn't exist, create a new RequestLog with this data.
     */
    create: XOR<RequestLogCreateInput, RequestLogUncheckedCreateInput>
    /**
     * In case the RequestLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RequestLogUpdateInput, RequestLogUncheckedUpdateInput>
  }

  /**
   * RequestLog delete
   */
  export type RequestLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
    /**
     * Filter which RequestLog to delete.
     */
    where: RequestLogWhereUniqueInput
  }

  /**
   * RequestLog deleteMany
   */
  export type RequestLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestLogs to delete
     */
    where?: RequestLogWhereInput
    /**
     * Limit how many RequestLogs to delete.
     */
    limit?: number
  }

  /**
   * RequestLog without action
   */
  export type RequestLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestLog
     */
    select?: RequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RequestLog
     */
    omit?: RequestLogOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const App_installsScalarFieldEnum: {
    id: 'id',
    user_id: 'user_id',
    device_id: 'device_id',
    platform: 'platform',
    app_version: 'app_version',
    installed_at: 'installed_at',
    last_active: 'last_active'
  };

  export type App_installsScalarFieldEnum = (typeof App_installsScalarFieldEnum)[keyof typeof App_installsScalarFieldEnum]


  export const Reminder_contentScalarFieldEnum: {
    id: 'id',
    reminder_user_id: 'reminder_user_id',
    title: 'title',
    description: 'description',
    remind_at: 'remind_at',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type Reminder_contentScalarFieldEnum = (typeof Reminder_contentScalarFieldEnum)[keyof typeof Reminder_contentScalarFieldEnum]


  export const Reminder_usersScalarFieldEnum: {
    id: 'id',
    user_id: 'user_id',
    max_reminders: 'max_reminders',
    created_at: 'created_at'
  };

  export type Reminder_usersScalarFieldEnum = (typeof Reminder_usersScalarFieldEnum)[keyof typeof Reminder_usersScalarFieldEnum]


  export const UsersScalarFieldEnum: {
    id: 'id',
    external_id: 'external_id',
    created_at: 'created_at',
    last_login_at: 'last_login_at',
    login_count: 'login_count'
  };

  export type UsersScalarFieldEnum = (typeof UsersScalarFieldEnum)[keyof typeof UsersScalarFieldEnum]


  export const ServerScalarFieldEnum: {
    id: 'id',
    name: 'name',
    url: 'url',
    enabled: 'enabled',
    healthy: 'healthy',
    weight: 'weight',
    priority: 'priority',
    requestsHandled: 'requestsHandled',
    activeRequests: 'activeRequests',
    lastHealthCheck: 'lastHealthCheck',
    averageResponseTime: 'averageResponseTime',
    failureCount: 'failureCount',
    deletedAt: 'deletedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ServerScalarFieldEnum = (typeof ServerScalarFieldEnum)[keyof typeof ServerScalarFieldEnum]


  export const SettingsScalarFieldEnum: {
    id: 'id',
    algorithm: 'algorithm',
    healthCheckInterval: 'healthCheckInterval',
    healthCheckTimeout: 'healthCheckTimeout',
    maxFailures: 'maxFailures',
    autoRecovery: 'autoRecovery',
    requestTimeout: 'requestTimeout',
    maxRetries: 'maxRetries',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SettingsScalarFieldEnum = (typeof SettingsScalarFieldEnum)[keyof typeof SettingsScalarFieldEnum]


  export const RequestLogScalarFieldEnum: {
    id: 'id',
    requestId: 'requestId',
    method: 'method',
    route: 'route',
    backendId: 'backendId',
    backendUrl: 'backendUrl',
    statusCode: 'statusCode',
    responseTimeMs: 'responseTimeMs',
    retryCount: 'retryCount',
    errorMessage: 'errorMessage',
    createdAt: 'createdAt'
  };

  export type RequestLogScalarFieldEnum = (typeof RequestLogScalarFieldEnum)[keyof typeof RequestLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'ReminderStatus'
   */
  export type EnumReminderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReminderStatus'>
    


  /**
   * Reference to a field of type 'ReminderStatus[]'
   */
  export type ListEnumReminderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReminderStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'ServerHealth'
   */
  export type EnumServerHealthFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServerHealth'>
    


  /**
   * Reference to a field of type 'ServerHealth[]'
   */
  export type ListEnumServerHealthFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServerHealth[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Algorithm'
   */
  export type EnumAlgorithmFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Algorithm'>
    


  /**
   * Reference to a field of type 'Algorithm[]'
   */
  export type ListEnumAlgorithmFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Algorithm[]'>
    


  /**
   * Reference to a field of type 'HttpMethod'
   */
  export type EnumHttpMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HttpMethod'>
    


  /**
   * Reference to a field of type 'HttpMethod[]'
   */
  export type ListEnumHttpMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HttpMethod[]'>
    
  /**
   * Deep Input Types
   */


  export type app_installsWhereInput = {
    AND?: app_installsWhereInput | app_installsWhereInput[]
    OR?: app_installsWhereInput[]
    NOT?: app_installsWhereInput | app_installsWhereInput[]
    id?: UuidFilter<"app_installs"> | string
    user_id?: StringNullableFilter<"app_installs"> | string | null
    device_id?: StringFilter<"app_installs"> | string
    platform?: StringFilter<"app_installs"> | string
    app_version?: StringNullableFilter<"app_installs"> | string | null
    installed_at?: DateTimeNullableFilter<"app_installs"> | Date | string | null
    last_active?: DateTimeNullableFilter<"app_installs"> | Date | string | null
    reminder_users?: XOR<Reminder_usersNullableScalarRelationFilter, reminder_usersWhereInput> | null
  }

  export type app_installsOrderByWithRelationInput = {
    id?: SortOrder
    user_id?: SortOrderInput | SortOrder
    device_id?: SortOrder
    platform?: SortOrder
    app_version?: SortOrderInput | SortOrder
    installed_at?: SortOrderInput | SortOrder
    last_active?: SortOrderInput | SortOrder
    reminder_users?: reminder_usersOrderByWithRelationInput
  }

  export type app_installsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    device_id?: string
    AND?: app_installsWhereInput | app_installsWhereInput[]
    OR?: app_installsWhereInput[]
    NOT?: app_installsWhereInput | app_installsWhereInput[]
    user_id?: StringNullableFilter<"app_installs"> | string | null
    platform?: StringFilter<"app_installs"> | string
    app_version?: StringNullableFilter<"app_installs"> | string | null
    installed_at?: DateTimeNullableFilter<"app_installs"> | Date | string | null
    last_active?: DateTimeNullableFilter<"app_installs"> | Date | string | null
    reminder_users?: XOR<Reminder_usersNullableScalarRelationFilter, reminder_usersWhereInput> | null
  }, "id" | "device_id">

  export type app_installsOrderByWithAggregationInput = {
    id?: SortOrder
    user_id?: SortOrderInput | SortOrder
    device_id?: SortOrder
    platform?: SortOrder
    app_version?: SortOrderInput | SortOrder
    installed_at?: SortOrderInput | SortOrder
    last_active?: SortOrderInput | SortOrder
    _count?: app_installsCountOrderByAggregateInput
    _max?: app_installsMaxOrderByAggregateInput
    _min?: app_installsMinOrderByAggregateInput
  }

  export type app_installsScalarWhereWithAggregatesInput = {
    AND?: app_installsScalarWhereWithAggregatesInput | app_installsScalarWhereWithAggregatesInput[]
    OR?: app_installsScalarWhereWithAggregatesInput[]
    NOT?: app_installsScalarWhereWithAggregatesInput | app_installsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"app_installs"> | string
    user_id?: StringNullableWithAggregatesFilter<"app_installs"> | string | null
    device_id?: StringWithAggregatesFilter<"app_installs"> | string
    platform?: StringWithAggregatesFilter<"app_installs"> | string
    app_version?: StringNullableWithAggregatesFilter<"app_installs"> | string | null
    installed_at?: DateTimeNullableWithAggregatesFilter<"app_installs"> | Date | string | null
    last_active?: DateTimeNullableWithAggregatesFilter<"app_installs"> | Date | string | null
  }

  export type reminder_contentWhereInput = {
    AND?: reminder_contentWhereInput | reminder_contentWhereInput[]
    OR?: reminder_contentWhereInput[]
    NOT?: reminder_contentWhereInput | reminder_contentWhereInput[]
    id?: UuidFilter<"reminder_content"> | string
    reminder_user_id?: UuidFilter<"reminder_content"> | string
    title?: StringFilter<"reminder_content"> | string
    description?: StringNullableFilter<"reminder_content"> | string | null
    remind_at?: DateTimeFilter<"reminder_content"> | Date | string
    status?: EnumReminderStatusFilter<"reminder_content"> | $Enums.ReminderStatus
    created_at?: DateTimeFilter<"reminder_content"> | Date | string
    updated_at?: DateTimeFilter<"reminder_content"> | Date | string
    reminder_users?: XOR<Reminder_usersScalarRelationFilter, reminder_usersWhereInput>
  }

  export type reminder_contentOrderByWithRelationInput = {
    id?: SortOrder
    reminder_user_id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    remind_at?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    reminder_users?: reminder_usersOrderByWithRelationInput
  }

  export type reminder_contentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: reminder_contentWhereInput | reminder_contentWhereInput[]
    OR?: reminder_contentWhereInput[]
    NOT?: reminder_contentWhereInput | reminder_contentWhereInput[]
    reminder_user_id?: UuidFilter<"reminder_content"> | string
    title?: StringFilter<"reminder_content"> | string
    description?: StringNullableFilter<"reminder_content"> | string | null
    remind_at?: DateTimeFilter<"reminder_content"> | Date | string
    status?: EnumReminderStatusFilter<"reminder_content"> | $Enums.ReminderStatus
    created_at?: DateTimeFilter<"reminder_content"> | Date | string
    updated_at?: DateTimeFilter<"reminder_content"> | Date | string
    reminder_users?: XOR<Reminder_usersScalarRelationFilter, reminder_usersWhereInput>
  }, "id">

  export type reminder_contentOrderByWithAggregationInput = {
    id?: SortOrder
    reminder_user_id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    remind_at?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: reminder_contentCountOrderByAggregateInput
    _max?: reminder_contentMaxOrderByAggregateInput
    _min?: reminder_contentMinOrderByAggregateInput
  }

  export type reminder_contentScalarWhereWithAggregatesInput = {
    AND?: reminder_contentScalarWhereWithAggregatesInput | reminder_contentScalarWhereWithAggregatesInput[]
    OR?: reminder_contentScalarWhereWithAggregatesInput[]
    NOT?: reminder_contentScalarWhereWithAggregatesInput | reminder_contentScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"reminder_content"> | string
    reminder_user_id?: UuidWithAggregatesFilter<"reminder_content"> | string
    title?: StringWithAggregatesFilter<"reminder_content"> | string
    description?: StringNullableWithAggregatesFilter<"reminder_content"> | string | null
    remind_at?: DateTimeWithAggregatesFilter<"reminder_content"> | Date | string
    status?: EnumReminderStatusWithAggregatesFilter<"reminder_content"> | $Enums.ReminderStatus
    created_at?: DateTimeWithAggregatesFilter<"reminder_content"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"reminder_content"> | Date | string
  }

  export type reminder_usersWhereInput = {
    AND?: reminder_usersWhereInput | reminder_usersWhereInput[]
    OR?: reminder_usersWhereInput[]
    NOT?: reminder_usersWhereInput | reminder_usersWhereInput[]
    id?: UuidFilter<"reminder_users"> | string
    user_id?: UuidFilter<"reminder_users"> | string
    max_reminders?: IntFilter<"reminder_users"> | number
    created_at?: DateTimeFilter<"reminder_users"> | Date | string
    reminder_content?: Reminder_contentListRelationFilter
    app_installs?: XOR<App_installsScalarRelationFilter, app_installsWhereInput>
  }

  export type reminder_usersOrderByWithRelationInput = {
    id?: SortOrder
    user_id?: SortOrder
    max_reminders?: SortOrder
    created_at?: SortOrder
    reminder_content?: reminder_contentOrderByRelationAggregateInput
    app_installs?: app_installsOrderByWithRelationInput
  }

  export type reminder_usersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    user_id?: string
    AND?: reminder_usersWhereInput | reminder_usersWhereInput[]
    OR?: reminder_usersWhereInput[]
    NOT?: reminder_usersWhereInput | reminder_usersWhereInput[]
    max_reminders?: IntFilter<"reminder_users"> | number
    created_at?: DateTimeFilter<"reminder_users"> | Date | string
    reminder_content?: Reminder_contentListRelationFilter
    app_installs?: XOR<App_installsScalarRelationFilter, app_installsWhereInput>
  }, "id" | "user_id">

  export type reminder_usersOrderByWithAggregationInput = {
    id?: SortOrder
    user_id?: SortOrder
    max_reminders?: SortOrder
    created_at?: SortOrder
    _count?: reminder_usersCountOrderByAggregateInput
    _avg?: reminder_usersAvgOrderByAggregateInput
    _max?: reminder_usersMaxOrderByAggregateInput
    _min?: reminder_usersMinOrderByAggregateInput
    _sum?: reminder_usersSumOrderByAggregateInput
  }

  export type reminder_usersScalarWhereWithAggregatesInput = {
    AND?: reminder_usersScalarWhereWithAggregatesInput | reminder_usersScalarWhereWithAggregatesInput[]
    OR?: reminder_usersScalarWhereWithAggregatesInput[]
    NOT?: reminder_usersScalarWhereWithAggregatesInput | reminder_usersScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"reminder_users"> | string
    user_id?: UuidWithAggregatesFilter<"reminder_users"> | string
    max_reminders?: IntWithAggregatesFilter<"reminder_users"> | number
    created_at?: DateTimeWithAggregatesFilter<"reminder_users"> | Date | string
  }

  export type usersWhereInput = {
    AND?: usersWhereInput | usersWhereInput[]
    OR?: usersWhereInput[]
    NOT?: usersWhereInput | usersWhereInput[]
    id?: UuidFilter<"users"> | string
    external_id?: StringFilter<"users"> | string
    created_at?: DateTimeFilter<"users"> | Date | string
    last_login_at?: DateTimeFilter<"users"> | Date | string
    login_count?: IntNullableFilter<"users"> | number | null
  }

  export type usersOrderByWithRelationInput = {
    id?: SortOrder
    external_id?: SortOrder
    created_at?: SortOrder
    last_login_at?: SortOrder
    login_count?: SortOrderInput | SortOrder
  }

  export type usersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    external_id?: string
    AND?: usersWhereInput | usersWhereInput[]
    OR?: usersWhereInput[]
    NOT?: usersWhereInput | usersWhereInput[]
    created_at?: DateTimeFilter<"users"> | Date | string
    last_login_at?: DateTimeFilter<"users"> | Date | string
    login_count?: IntNullableFilter<"users"> | number | null
  }, "id" | "external_id">

  export type usersOrderByWithAggregationInput = {
    id?: SortOrder
    external_id?: SortOrder
    created_at?: SortOrder
    last_login_at?: SortOrder
    login_count?: SortOrderInput | SortOrder
    _count?: usersCountOrderByAggregateInput
    _avg?: usersAvgOrderByAggregateInput
    _max?: usersMaxOrderByAggregateInput
    _min?: usersMinOrderByAggregateInput
    _sum?: usersSumOrderByAggregateInput
  }

  export type usersScalarWhereWithAggregatesInput = {
    AND?: usersScalarWhereWithAggregatesInput | usersScalarWhereWithAggregatesInput[]
    OR?: usersScalarWhereWithAggregatesInput[]
    NOT?: usersScalarWhereWithAggregatesInput | usersScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"users"> | string
    external_id?: StringWithAggregatesFilter<"users"> | string
    created_at?: DateTimeWithAggregatesFilter<"users"> | Date | string
    last_login_at?: DateTimeWithAggregatesFilter<"users"> | Date | string
    login_count?: IntNullableWithAggregatesFilter<"users"> | number | null
  }

  export type ServerWhereInput = {
    AND?: ServerWhereInput | ServerWhereInput[]
    OR?: ServerWhereInput[]
    NOT?: ServerWhereInput | ServerWhereInput[]
    id?: UuidFilter<"Server"> | string
    name?: StringFilter<"Server"> | string
    url?: StringFilter<"Server"> | string
    enabled?: BoolFilter<"Server"> | boolean
    healthy?: EnumServerHealthFilter<"Server"> | $Enums.ServerHealth
    weight?: IntFilter<"Server"> | number
    priority?: IntFilter<"Server"> | number
    requestsHandled?: IntFilter<"Server"> | number
    activeRequests?: IntFilter<"Server"> | number
    lastHealthCheck?: DateTimeNullableFilter<"Server"> | Date | string | null
    averageResponseTime?: FloatFilter<"Server"> | number
    failureCount?: IntFilter<"Server"> | number
    deletedAt?: DateTimeNullableFilter<"Server"> | Date | string | null
    createdAt?: DateTimeFilter<"Server"> | Date | string
    updatedAt?: DateTimeFilter<"Server"> | Date | string
  }

  export type ServerOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    url?: SortOrder
    enabled?: SortOrder
    healthy?: SortOrder
    weight?: SortOrder
    priority?: SortOrder
    requestsHandled?: SortOrder
    activeRequests?: SortOrder
    lastHealthCheck?: SortOrderInput | SortOrder
    averageResponseTime?: SortOrder
    failureCount?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ServerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    url?: string
    AND?: ServerWhereInput | ServerWhereInput[]
    OR?: ServerWhereInput[]
    NOT?: ServerWhereInput | ServerWhereInput[]
    name?: StringFilter<"Server"> | string
    enabled?: BoolFilter<"Server"> | boolean
    healthy?: EnumServerHealthFilter<"Server"> | $Enums.ServerHealth
    weight?: IntFilter<"Server"> | number
    priority?: IntFilter<"Server"> | number
    requestsHandled?: IntFilter<"Server"> | number
    activeRequests?: IntFilter<"Server"> | number
    lastHealthCheck?: DateTimeNullableFilter<"Server"> | Date | string | null
    averageResponseTime?: FloatFilter<"Server"> | number
    failureCount?: IntFilter<"Server"> | number
    deletedAt?: DateTimeNullableFilter<"Server"> | Date | string | null
    createdAt?: DateTimeFilter<"Server"> | Date | string
    updatedAt?: DateTimeFilter<"Server"> | Date | string
  }, "id" | "url">

  export type ServerOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    url?: SortOrder
    enabled?: SortOrder
    healthy?: SortOrder
    weight?: SortOrder
    priority?: SortOrder
    requestsHandled?: SortOrder
    activeRequests?: SortOrder
    lastHealthCheck?: SortOrderInput | SortOrder
    averageResponseTime?: SortOrder
    failureCount?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ServerCountOrderByAggregateInput
    _avg?: ServerAvgOrderByAggregateInput
    _max?: ServerMaxOrderByAggregateInput
    _min?: ServerMinOrderByAggregateInput
    _sum?: ServerSumOrderByAggregateInput
  }

  export type ServerScalarWhereWithAggregatesInput = {
    AND?: ServerScalarWhereWithAggregatesInput | ServerScalarWhereWithAggregatesInput[]
    OR?: ServerScalarWhereWithAggregatesInput[]
    NOT?: ServerScalarWhereWithAggregatesInput | ServerScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Server"> | string
    name?: StringWithAggregatesFilter<"Server"> | string
    url?: StringWithAggregatesFilter<"Server"> | string
    enabled?: BoolWithAggregatesFilter<"Server"> | boolean
    healthy?: EnumServerHealthWithAggregatesFilter<"Server"> | $Enums.ServerHealth
    weight?: IntWithAggregatesFilter<"Server"> | number
    priority?: IntWithAggregatesFilter<"Server"> | number
    requestsHandled?: IntWithAggregatesFilter<"Server"> | number
    activeRequests?: IntWithAggregatesFilter<"Server"> | number
    lastHealthCheck?: DateTimeNullableWithAggregatesFilter<"Server"> | Date | string | null
    averageResponseTime?: FloatWithAggregatesFilter<"Server"> | number
    failureCount?: IntWithAggregatesFilter<"Server"> | number
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Server"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Server"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Server"> | Date | string
  }

  export type SettingsWhereInput = {
    AND?: SettingsWhereInput | SettingsWhereInput[]
    OR?: SettingsWhereInput[]
    NOT?: SettingsWhereInput | SettingsWhereInput[]
    id?: UuidFilter<"Settings"> | string
    algorithm?: EnumAlgorithmFilter<"Settings"> | $Enums.Algorithm
    healthCheckInterval?: IntFilter<"Settings"> | number
    healthCheckTimeout?: IntFilter<"Settings"> | number
    maxFailures?: IntFilter<"Settings"> | number
    autoRecovery?: BoolFilter<"Settings"> | boolean
    requestTimeout?: IntFilter<"Settings"> | number
    maxRetries?: IntFilter<"Settings"> | number
    createdAt?: DateTimeFilter<"Settings"> | Date | string
    updatedAt?: DateTimeFilter<"Settings"> | Date | string
  }

  export type SettingsOrderByWithRelationInput = {
    id?: SortOrder
    algorithm?: SortOrder
    healthCheckInterval?: SortOrder
    healthCheckTimeout?: SortOrder
    maxFailures?: SortOrder
    autoRecovery?: SortOrder
    requestTimeout?: SortOrder
    maxRetries?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SettingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SettingsWhereInput | SettingsWhereInput[]
    OR?: SettingsWhereInput[]
    NOT?: SettingsWhereInput | SettingsWhereInput[]
    algorithm?: EnumAlgorithmFilter<"Settings"> | $Enums.Algorithm
    healthCheckInterval?: IntFilter<"Settings"> | number
    healthCheckTimeout?: IntFilter<"Settings"> | number
    maxFailures?: IntFilter<"Settings"> | number
    autoRecovery?: BoolFilter<"Settings"> | boolean
    requestTimeout?: IntFilter<"Settings"> | number
    maxRetries?: IntFilter<"Settings"> | number
    createdAt?: DateTimeFilter<"Settings"> | Date | string
    updatedAt?: DateTimeFilter<"Settings"> | Date | string
  }, "id">

  export type SettingsOrderByWithAggregationInput = {
    id?: SortOrder
    algorithm?: SortOrder
    healthCheckInterval?: SortOrder
    healthCheckTimeout?: SortOrder
    maxFailures?: SortOrder
    autoRecovery?: SortOrder
    requestTimeout?: SortOrder
    maxRetries?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SettingsCountOrderByAggregateInput
    _avg?: SettingsAvgOrderByAggregateInput
    _max?: SettingsMaxOrderByAggregateInput
    _min?: SettingsMinOrderByAggregateInput
    _sum?: SettingsSumOrderByAggregateInput
  }

  export type SettingsScalarWhereWithAggregatesInput = {
    AND?: SettingsScalarWhereWithAggregatesInput | SettingsScalarWhereWithAggregatesInput[]
    OR?: SettingsScalarWhereWithAggregatesInput[]
    NOT?: SettingsScalarWhereWithAggregatesInput | SettingsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Settings"> | string
    algorithm?: EnumAlgorithmWithAggregatesFilter<"Settings"> | $Enums.Algorithm
    healthCheckInterval?: IntWithAggregatesFilter<"Settings"> | number
    healthCheckTimeout?: IntWithAggregatesFilter<"Settings"> | number
    maxFailures?: IntWithAggregatesFilter<"Settings"> | number
    autoRecovery?: BoolWithAggregatesFilter<"Settings"> | boolean
    requestTimeout?: IntWithAggregatesFilter<"Settings"> | number
    maxRetries?: IntWithAggregatesFilter<"Settings"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Settings"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Settings"> | Date | string
  }

  export type RequestLogWhereInput = {
    AND?: RequestLogWhereInput | RequestLogWhereInput[]
    OR?: RequestLogWhereInput[]
    NOT?: RequestLogWhereInput | RequestLogWhereInput[]
    id?: UuidFilter<"RequestLog"> | string
    requestId?: UuidFilter<"RequestLog"> | string
    method?: EnumHttpMethodFilter<"RequestLog"> | $Enums.HttpMethod
    route?: StringFilter<"RequestLog"> | string
    backendId?: UuidNullableFilter<"RequestLog"> | string | null
    backendUrl?: StringNullableFilter<"RequestLog"> | string | null
    statusCode?: IntNullableFilter<"RequestLog"> | number | null
    responseTimeMs?: IntNullableFilter<"RequestLog"> | number | null
    retryCount?: IntFilter<"RequestLog"> | number
    errorMessage?: StringNullableFilter<"RequestLog"> | string | null
    createdAt?: DateTimeFilter<"RequestLog"> | Date | string
  }

  export type RequestLogOrderByWithRelationInput = {
    id?: SortOrder
    requestId?: SortOrder
    method?: SortOrder
    route?: SortOrder
    backendId?: SortOrderInput | SortOrder
    backendUrl?: SortOrderInput | SortOrder
    statusCode?: SortOrderInput | SortOrder
    responseTimeMs?: SortOrderInput | SortOrder
    retryCount?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type RequestLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RequestLogWhereInput | RequestLogWhereInput[]
    OR?: RequestLogWhereInput[]
    NOT?: RequestLogWhereInput | RequestLogWhereInput[]
    requestId?: UuidFilter<"RequestLog"> | string
    method?: EnumHttpMethodFilter<"RequestLog"> | $Enums.HttpMethod
    route?: StringFilter<"RequestLog"> | string
    backendId?: UuidNullableFilter<"RequestLog"> | string | null
    backendUrl?: StringNullableFilter<"RequestLog"> | string | null
    statusCode?: IntNullableFilter<"RequestLog"> | number | null
    responseTimeMs?: IntNullableFilter<"RequestLog"> | number | null
    retryCount?: IntFilter<"RequestLog"> | number
    errorMessage?: StringNullableFilter<"RequestLog"> | string | null
    createdAt?: DateTimeFilter<"RequestLog"> | Date | string
  }, "id">

  export type RequestLogOrderByWithAggregationInput = {
    id?: SortOrder
    requestId?: SortOrder
    method?: SortOrder
    route?: SortOrder
    backendId?: SortOrderInput | SortOrder
    backendUrl?: SortOrderInput | SortOrder
    statusCode?: SortOrderInput | SortOrder
    responseTimeMs?: SortOrderInput | SortOrder
    retryCount?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: RequestLogCountOrderByAggregateInput
    _avg?: RequestLogAvgOrderByAggregateInput
    _max?: RequestLogMaxOrderByAggregateInput
    _min?: RequestLogMinOrderByAggregateInput
    _sum?: RequestLogSumOrderByAggregateInput
  }

  export type RequestLogScalarWhereWithAggregatesInput = {
    AND?: RequestLogScalarWhereWithAggregatesInput | RequestLogScalarWhereWithAggregatesInput[]
    OR?: RequestLogScalarWhereWithAggregatesInput[]
    NOT?: RequestLogScalarWhereWithAggregatesInput | RequestLogScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"RequestLog"> | string
    requestId?: UuidWithAggregatesFilter<"RequestLog"> | string
    method?: EnumHttpMethodWithAggregatesFilter<"RequestLog"> | $Enums.HttpMethod
    route?: StringWithAggregatesFilter<"RequestLog"> | string
    backendId?: UuidNullableWithAggregatesFilter<"RequestLog"> | string | null
    backendUrl?: StringNullableWithAggregatesFilter<"RequestLog"> | string | null
    statusCode?: IntNullableWithAggregatesFilter<"RequestLog"> | number | null
    responseTimeMs?: IntNullableWithAggregatesFilter<"RequestLog"> | number | null
    retryCount?: IntWithAggregatesFilter<"RequestLog"> | number
    errorMessage?: StringNullableWithAggregatesFilter<"RequestLog"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"RequestLog"> | Date | string
  }

  export type app_installsCreateInput = {
    id?: string
    user_id?: string | null
    device_id: string
    platform: string
    app_version?: string | null
    installed_at?: Date | string | null
    last_active?: Date | string | null
    reminder_users?: reminder_usersCreateNestedOneWithoutApp_installsInput
  }

  export type app_installsUncheckedCreateInput = {
    id?: string
    user_id?: string | null
    device_id: string
    platform: string
    app_version?: string | null
    installed_at?: Date | string | null
    last_active?: Date | string | null
    reminder_users?: reminder_usersUncheckedCreateNestedOneWithoutApp_installsInput
  }

  export type app_installsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    device_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    app_version?: NullableStringFieldUpdateOperationsInput | string | null
    installed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_active?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    reminder_users?: reminder_usersUpdateOneWithoutApp_installsNestedInput
  }

  export type app_installsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    device_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    app_version?: NullableStringFieldUpdateOperationsInput | string | null
    installed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_active?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    reminder_users?: reminder_usersUncheckedUpdateOneWithoutApp_installsNestedInput
  }

  export type app_installsCreateManyInput = {
    id?: string
    user_id?: string | null
    device_id: string
    platform: string
    app_version?: string | null
    installed_at?: Date | string | null
    last_active?: Date | string | null
  }

  export type app_installsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    device_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    app_version?: NullableStringFieldUpdateOperationsInput | string | null
    installed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_active?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type app_installsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    device_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    app_version?: NullableStringFieldUpdateOperationsInput | string | null
    installed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_active?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type reminder_contentCreateInput = {
    id?: string
    title: string
    description?: string | null
    remind_at: Date | string
    status?: $Enums.ReminderStatus
    created_at: Date | string
    updated_at: Date | string
    reminder_users?: reminder_usersCreateNestedOneWithoutReminder_contentInput
  }

  export type reminder_contentUncheckedCreateInput = {
    id?: string
    reminder_user_id?: string
    title: string
    description?: string | null
    remind_at: Date | string
    status?: $Enums.ReminderStatus
    created_at: Date | string
    updated_at: Date | string
  }

  export type reminder_contentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    remind_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumReminderStatusFieldUpdateOperationsInput | $Enums.ReminderStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    reminder_users?: reminder_usersUpdateOneRequiredWithoutReminder_contentNestedInput
  }

  export type reminder_contentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    reminder_user_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    remind_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumReminderStatusFieldUpdateOperationsInput | $Enums.ReminderStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type reminder_contentCreateManyInput = {
    id?: string
    reminder_user_id?: string
    title: string
    description?: string | null
    remind_at: Date | string
    status?: $Enums.ReminderStatus
    created_at: Date | string
    updated_at: Date | string
  }

  export type reminder_contentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    remind_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumReminderStatusFieldUpdateOperationsInput | $Enums.ReminderStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type reminder_contentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    reminder_user_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    remind_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumReminderStatusFieldUpdateOperationsInput | $Enums.ReminderStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type reminder_usersCreateInput = {
    id?: string
    max_reminders?: number
    created_at?: Date | string
    reminder_content?: reminder_contentCreateNestedManyWithoutReminder_usersInput
    app_installs?: app_installsCreateNestedOneWithoutReminder_usersInput
  }

  export type reminder_usersUncheckedCreateInput = {
    id?: string
    user_id?: string
    max_reminders?: number
    created_at?: Date | string
    reminder_content?: reminder_contentUncheckedCreateNestedManyWithoutReminder_usersInput
  }

  export type reminder_usersUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    max_reminders?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    reminder_content?: reminder_contentUpdateManyWithoutReminder_usersNestedInput
    app_installs?: app_installsUpdateOneRequiredWithoutReminder_usersNestedInput
  }

  export type reminder_usersUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    max_reminders?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    reminder_content?: reminder_contentUncheckedUpdateManyWithoutReminder_usersNestedInput
  }

  export type reminder_usersCreateManyInput = {
    id?: string
    user_id?: string
    max_reminders?: number
    created_at?: Date | string
  }

  export type reminder_usersUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    max_reminders?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type reminder_usersUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    max_reminders?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type usersCreateInput = {
    id?: string
    external_id: string
    created_at: Date | string
    last_login_at: Date | string
    login_count?: number | null
  }

  export type usersUncheckedCreateInput = {
    id?: string
    external_id: string
    created_at: Date | string
    last_login_at: Date | string
    login_count?: number | null
  }

  export type usersUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    external_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login_at?: DateTimeFieldUpdateOperationsInput | Date | string
    login_count?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type usersUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    external_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login_at?: DateTimeFieldUpdateOperationsInput | Date | string
    login_count?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type usersCreateManyInput = {
    id?: string
    external_id: string
    created_at: Date | string
    last_login_at: Date | string
    login_count?: number | null
  }

  export type usersUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    external_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login_at?: DateTimeFieldUpdateOperationsInput | Date | string
    login_count?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type usersUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    external_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login_at?: DateTimeFieldUpdateOperationsInput | Date | string
    login_count?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ServerCreateInput = {
    id?: string
    name: string
    url: string
    enabled?: boolean
    healthy?: $Enums.ServerHealth
    weight?: number
    priority?: number
    requestsHandled?: number
    activeRequests?: number
    lastHealthCheck?: Date | string | null
    averageResponseTime?: number
    failureCount?: number
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServerUncheckedCreateInput = {
    id?: string
    name: string
    url: string
    enabled?: boolean
    healthy?: $Enums.ServerHealth
    weight?: number
    priority?: number
    requestsHandled?: number
    activeRequests?: number
    lastHealthCheck?: Date | string | null
    averageResponseTime?: number
    failureCount?: number
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    healthy?: EnumServerHealthFieldUpdateOperationsInput | $Enums.ServerHealth
    weight?: IntFieldUpdateOperationsInput | number
    priority?: IntFieldUpdateOperationsInput | number
    requestsHandled?: IntFieldUpdateOperationsInput | number
    activeRequests?: IntFieldUpdateOperationsInput | number
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    averageResponseTime?: FloatFieldUpdateOperationsInput | number
    failureCount?: IntFieldUpdateOperationsInput | number
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    healthy?: EnumServerHealthFieldUpdateOperationsInput | $Enums.ServerHealth
    weight?: IntFieldUpdateOperationsInput | number
    priority?: IntFieldUpdateOperationsInput | number
    requestsHandled?: IntFieldUpdateOperationsInput | number
    activeRequests?: IntFieldUpdateOperationsInput | number
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    averageResponseTime?: FloatFieldUpdateOperationsInput | number
    failureCount?: IntFieldUpdateOperationsInput | number
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServerCreateManyInput = {
    id?: string
    name: string
    url: string
    enabled?: boolean
    healthy?: $Enums.ServerHealth
    weight?: number
    priority?: number
    requestsHandled?: number
    activeRequests?: number
    lastHealthCheck?: Date | string | null
    averageResponseTime?: number
    failureCount?: number
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    healthy?: EnumServerHealthFieldUpdateOperationsInput | $Enums.ServerHealth
    weight?: IntFieldUpdateOperationsInput | number
    priority?: IntFieldUpdateOperationsInput | number
    requestsHandled?: IntFieldUpdateOperationsInput | number
    activeRequests?: IntFieldUpdateOperationsInput | number
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    averageResponseTime?: FloatFieldUpdateOperationsInput | number
    failureCount?: IntFieldUpdateOperationsInput | number
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    healthy?: EnumServerHealthFieldUpdateOperationsInput | $Enums.ServerHealth
    weight?: IntFieldUpdateOperationsInput | number
    priority?: IntFieldUpdateOperationsInput | number
    requestsHandled?: IntFieldUpdateOperationsInput | number
    activeRequests?: IntFieldUpdateOperationsInput | number
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    averageResponseTime?: FloatFieldUpdateOperationsInput | number
    failureCount?: IntFieldUpdateOperationsInput | number
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingsCreateInput = {
    id?: string
    algorithm?: $Enums.Algorithm
    healthCheckInterval?: number
    healthCheckTimeout?: number
    maxFailures?: number
    autoRecovery?: boolean
    requestTimeout?: number
    maxRetries?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SettingsUncheckedCreateInput = {
    id?: string
    algorithm?: $Enums.Algorithm
    healthCheckInterval?: number
    healthCheckTimeout?: number
    maxFailures?: number
    autoRecovery?: boolean
    requestTimeout?: number
    maxRetries?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SettingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    algorithm?: EnumAlgorithmFieldUpdateOperationsInput | $Enums.Algorithm
    healthCheckInterval?: IntFieldUpdateOperationsInput | number
    healthCheckTimeout?: IntFieldUpdateOperationsInput | number
    maxFailures?: IntFieldUpdateOperationsInput | number
    autoRecovery?: BoolFieldUpdateOperationsInput | boolean
    requestTimeout?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    algorithm?: EnumAlgorithmFieldUpdateOperationsInput | $Enums.Algorithm
    healthCheckInterval?: IntFieldUpdateOperationsInput | number
    healthCheckTimeout?: IntFieldUpdateOperationsInput | number
    maxFailures?: IntFieldUpdateOperationsInput | number
    autoRecovery?: BoolFieldUpdateOperationsInput | boolean
    requestTimeout?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingsCreateManyInput = {
    id?: string
    algorithm?: $Enums.Algorithm
    healthCheckInterval?: number
    healthCheckTimeout?: number
    maxFailures?: number
    autoRecovery?: boolean
    requestTimeout?: number
    maxRetries?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SettingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    algorithm?: EnumAlgorithmFieldUpdateOperationsInput | $Enums.Algorithm
    healthCheckInterval?: IntFieldUpdateOperationsInput | number
    healthCheckTimeout?: IntFieldUpdateOperationsInput | number
    maxFailures?: IntFieldUpdateOperationsInput | number
    autoRecovery?: BoolFieldUpdateOperationsInput | boolean
    requestTimeout?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    algorithm?: EnumAlgorithmFieldUpdateOperationsInput | $Enums.Algorithm
    healthCheckInterval?: IntFieldUpdateOperationsInput | number
    healthCheckTimeout?: IntFieldUpdateOperationsInput | number
    maxFailures?: IntFieldUpdateOperationsInput | number
    autoRecovery?: BoolFieldUpdateOperationsInput | boolean
    requestTimeout?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestLogCreateInput = {
    id?: string
    requestId: string
    method: $Enums.HttpMethod
    route: string
    backendId?: string | null
    backendUrl?: string | null
    statusCode?: number | null
    responseTimeMs?: number | null
    retryCount?: number
    errorMessage?: string | null
    createdAt?: Date | string
  }

  export type RequestLogUncheckedCreateInput = {
    id?: string
    requestId: string
    method: $Enums.HttpMethod
    route: string
    backendId?: string | null
    backendUrl?: string | null
    statusCode?: number | null
    responseTimeMs?: number | null
    retryCount?: number
    errorMessage?: string | null
    createdAt?: Date | string
  }

  export type RequestLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    route?: StringFieldUpdateOperationsInput | string
    backendId?: NullableStringFieldUpdateOperationsInput | string | null
    backendUrl?: NullableStringFieldUpdateOperationsInput | string | null
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    responseTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    retryCount?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    route?: StringFieldUpdateOperationsInput | string
    backendId?: NullableStringFieldUpdateOperationsInput | string | null
    backendUrl?: NullableStringFieldUpdateOperationsInput | string | null
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    responseTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    retryCount?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestLogCreateManyInput = {
    id?: string
    requestId: string
    method: $Enums.HttpMethod
    route: string
    backendId?: string | null
    backendUrl?: string | null
    statusCode?: number | null
    responseTimeMs?: number | null
    retryCount?: number
    errorMessage?: string | null
    createdAt?: Date | string
  }

  export type RequestLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    route?: StringFieldUpdateOperationsInput | string
    backendId?: NullableStringFieldUpdateOperationsInput | string | null
    backendUrl?: NullableStringFieldUpdateOperationsInput | string | null
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    responseTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    retryCount?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    route?: StringFieldUpdateOperationsInput | string
    backendId?: NullableStringFieldUpdateOperationsInput | string | null
    backendUrl?: NullableStringFieldUpdateOperationsInput | string | null
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    responseTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    retryCount?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type Reminder_usersNullableScalarRelationFilter = {
    is?: reminder_usersWhereInput | null
    isNot?: reminder_usersWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type app_installsCountOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    device_id?: SortOrder
    platform?: SortOrder
    app_version?: SortOrder
    installed_at?: SortOrder
    last_active?: SortOrder
  }

  export type app_installsMaxOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    device_id?: SortOrder
    platform?: SortOrder
    app_version?: SortOrder
    installed_at?: SortOrder
    last_active?: SortOrder
  }

  export type app_installsMinOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    device_id?: SortOrder
    platform?: SortOrder
    app_version?: SortOrder
    installed_at?: SortOrder
    last_active?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type EnumReminderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ReminderStatus | EnumReminderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReminderStatus[] | ListEnumReminderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReminderStatus[] | ListEnumReminderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReminderStatusFilter<$PrismaModel> | $Enums.ReminderStatus
  }

  export type Reminder_usersScalarRelationFilter = {
    is?: reminder_usersWhereInput
    isNot?: reminder_usersWhereInput
  }

  export type reminder_contentCountOrderByAggregateInput = {
    id?: SortOrder
    reminder_user_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    remind_at?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type reminder_contentMaxOrderByAggregateInput = {
    id?: SortOrder
    reminder_user_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    remind_at?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type reminder_contentMinOrderByAggregateInput = {
    id?: SortOrder
    reminder_user_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    remind_at?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumReminderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReminderStatus | EnumReminderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReminderStatus[] | ListEnumReminderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReminderStatus[] | ListEnumReminderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReminderStatusWithAggregatesFilter<$PrismaModel> | $Enums.ReminderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumReminderStatusFilter<$PrismaModel>
    _max?: NestedEnumReminderStatusFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type Reminder_contentListRelationFilter = {
    every?: reminder_contentWhereInput
    some?: reminder_contentWhereInput
    none?: reminder_contentWhereInput
  }

  export type App_installsScalarRelationFilter = {
    is?: app_installsWhereInput
    isNot?: app_installsWhereInput
  }

  export type reminder_contentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type reminder_usersCountOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    max_reminders?: SortOrder
    created_at?: SortOrder
  }

  export type reminder_usersAvgOrderByAggregateInput = {
    max_reminders?: SortOrder
  }

  export type reminder_usersMaxOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    max_reminders?: SortOrder
    created_at?: SortOrder
  }

  export type reminder_usersMinOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    max_reminders?: SortOrder
    created_at?: SortOrder
  }

  export type reminder_usersSumOrderByAggregateInput = {
    max_reminders?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type usersCountOrderByAggregateInput = {
    id?: SortOrder
    external_id?: SortOrder
    created_at?: SortOrder
    last_login_at?: SortOrder
    login_count?: SortOrder
  }

  export type usersAvgOrderByAggregateInput = {
    login_count?: SortOrder
  }

  export type usersMaxOrderByAggregateInput = {
    id?: SortOrder
    external_id?: SortOrder
    created_at?: SortOrder
    last_login_at?: SortOrder
    login_count?: SortOrder
  }

  export type usersMinOrderByAggregateInput = {
    id?: SortOrder
    external_id?: SortOrder
    created_at?: SortOrder
    last_login_at?: SortOrder
    login_count?: SortOrder
  }

  export type usersSumOrderByAggregateInput = {
    login_count?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EnumServerHealthFilter<$PrismaModel = never> = {
    equals?: $Enums.ServerHealth | EnumServerHealthFieldRefInput<$PrismaModel>
    in?: $Enums.ServerHealth[] | ListEnumServerHealthFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServerHealth[] | ListEnumServerHealthFieldRefInput<$PrismaModel>
    not?: NestedEnumServerHealthFilter<$PrismaModel> | $Enums.ServerHealth
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type ServerCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    url?: SortOrder
    enabled?: SortOrder
    healthy?: SortOrder
    weight?: SortOrder
    priority?: SortOrder
    requestsHandled?: SortOrder
    activeRequests?: SortOrder
    lastHealthCheck?: SortOrder
    averageResponseTime?: SortOrder
    failureCount?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ServerAvgOrderByAggregateInput = {
    weight?: SortOrder
    priority?: SortOrder
    requestsHandled?: SortOrder
    activeRequests?: SortOrder
    averageResponseTime?: SortOrder
    failureCount?: SortOrder
  }

  export type ServerMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    url?: SortOrder
    enabled?: SortOrder
    healthy?: SortOrder
    weight?: SortOrder
    priority?: SortOrder
    requestsHandled?: SortOrder
    activeRequests?: SortOrder
    lastHealthCheck?: SortOrder
    averageResponseTime?: SortOrder
    failureCount?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ServerMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    url?: SortOrder
    enabled?: SortOrder
    healthy?: SortOrder
    weight?: SortOrder
    priority?: SortOrder
    requestsHandled?: SortOrder
    activeRequests?: SortOrder
    lastHealthCheck?: SortOrder
    averageResponseTime?: SortOrder
    failureCount?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ServerSumOrderByAggregateInput = {
    weight?: SortOrder
    priority?: SortOrder
    requestsHandled?: SortOrder
    activeRequests?: SortOrder
    averageResponseTime?: SortOrder
    failureCount?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumServerHealthWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServerHealth | EnumServerHealthFieldRefInput<$PrismaModel>
    in?: $Enums.ServerHealth[] | ListEnumServerHealthFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServerHealth[] | ListEnumServerHealthFieldRefInput<$PrismaModel>
    not?: NestedEnumServerHealthWithAggregatesFilter<$PrismaModel> | $Enums.ServerHealth
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumServerHealthFilter<$PrismaModel>
    _max?: NestedEnumServerHealthFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumAlgorithmFilter<$PrismaModel = never> = {
    equals?: $Enums.Algorithm | EnumAlgorithmFieldRefInput<$PrismaModel>
    in?: $Enums.Algorithm[] | ListEnumAlgorithmFieldRefInput<$PrismaModel>
    notIn?: $Enums.Algorithm[] | ListEnumAlgorithmFieldRefInput<$PrismaModel>
    not?: NestedEnumAlgorithmFilter<$PrismaModel> | $Enums.Algorithm
  }

  export type SettingsCountOrderByAggregateInput = {
    id?: SortOrder
    algorithm?: SortOrder
    healthCheckInterval?: SortOrder
    healthCheckTimeout?: SortOrder
    maxFailures?: SortOrder
    autoRecovery?: SortOrder
    requestTimeout?: SortOrder
    maxRetries?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SettingsAvgOrderByAggregateInput = {
    healthCheckInterval?: SortOrder
    healthCheckTimeout?: SortOrder
    maxFailures?: SortOrder
    requestTimeout?: SortOrder
    maxRetries?: SortOrder
  }

  export type SettingsMaxOrderByAggregateInput = {
    id?: SortOrder
    algorithm?: SortOrder
    healthCheckInterval?: SortOrder
    healthCheckTimeout?: SortOrder
    maxFailures?: SortOrder
    autoRecovery?: SortOrder
    requestTimeout?: SortOrder
    maxRetries?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SettingsMinOrderByAggregateInput = {
    id?: SortOrder
    algorithm?: SortOrder
    healthCheckInterval?: SortOrder
    healthCheckTimeout?: SortOrder
    maxFailures?: SortOrder
    autoRecovery?: SortOrder
    requestTimeout?: SortOrder
    maxRetries?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SettingsSumOrderByAggregateInput = {
    healthCheckInterval?: SortOrder
    healthCheckTimeout?: SortOrder
    maxFailures?: SortOrder
    requestTimeout?: SortOrder
    maxRetries?: SortOrder
  }

  export type EnumAlgorithmWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Algorithm | EnumAlgorithmFieldRefInput<$PrismaModel>
    in?: $Enums.Algorithm[] | ListEnumAlgorithmFieldRefInput<$PrismaModel>
    notIn?: $Enums.Algorithm[] | ListEnumAlgorithmFieldRefInput<$PrismaModel>
    not?: NestedEnumAlgorithmWithAggregatesFilter<$PrismaModel> | $Enums.Algorithm
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlgorithmFilter<$PrismaModel>
    _max?: NestedEnumAlgorithmFilter<$PrismaModel>
  }

  export type EnumHttpMethodFilter<$PrismaModel = never> = {
    equals?: $Enums.HttpMethod | EnumHttpMethodFieldRefInput<$PrismaModel>
    in?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumHttpMethodFilter<$PrismaModel> | $Enums.HttpMethod
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type RequestLogCountOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    method?: SortOrder
    route?: SortOrder
    backendId?: SortOrder
    backendUrl?: SortOrder
    statusCode?: SortOrder
    responseTimeMs?: SortOrder
    retryCount?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
  }

  export type RequestLogAvgOrderByAggregateInput = {
    statusCode?: SortOrder
    responseTimeMs?: SortOrder
    retryCount?: SortOrder
  }

  export type RequestLogMaxOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    method?: SortOrder
    route?: SortOrder
    backendId?: SortOrder
    backendUrl?: SortOrder
    statusCode?: SortOrder
    responseTimeMs?: SortOrder
    retryCount?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
  }

  export type RequestLogMinOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    method?: SortOrder
    route?: SortOrder
    backendId?: SortOrder
    backendUrl?: SortOrder
    statusCode?: SortOrder
    responseTimeMs?: SortOrder
    retryCount?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
  }

  export type RequestLogSumOrderByAggregateInput = {
    statusCode?: SortOrder
    responseTimeMs?: SortOrder
    retryCount?: SortOrder
  }

  export type EnumHttpMethodWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.HttpMethod | EnumHttpMethodFieldRefInput<$PrismaModel>
    in?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumHttpMethodWithAggregatesFilter<$PrismaModel> | $Enums.HttpMethod
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumHttpMethodFilter<$PrismaModel>
    _max?: NestedEnumHttpMethodFilter<$PrismaModel>
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type reminder_usersCreateNestedOneWithoutApp_installsInput = {
    create?: XOR<reminder_usersCreateWithoutApp_installsInput, reminder_usersUncheckedCreateWithoutApp_installsInput>
    connectOrCreate?: reminder_usersCreateOrConnectWithoutApp_installsInput
    connect?: reminder_usersWhereUniqueInput
  }

  export type reminder_usersUncheckedCreateNestedOneWithoutApp_installsInput = {
    create?: XOR<reminder_usersCreateWithoutApp_installsInput, reminder_usersUncheckedCreateWithoutApp_installsInput>
    connectOrCreate?: reminder_usersCreateOrConnectWithoutApp_installsInput
    connect?: reminder_usersWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type reminder_usersUpdateOneWithoutApp_installsNestedInput = {
    create?: XOR<reminder_usersCreateWithoutApp_installsInput, reminder_usersUncheckedCreateWithoutApp_installsInput>
    connectOrCreate?: reminder_usersCreateOrConnectWithoutApp_installsInput
    upsert?: reminder_usersUpsertWithoutApp_installsInput
    disconnect?: reminder_usersWhereInput | boolean
    delete?: reminder_usersWhereInput | boolean
    connect?: reminder_usersWhereUniqueInput
    update?: XOR<XOR<reminder_usersUpdateToOneWithWhereWithoutApp_installsInput, reminder_usersUpdateWithoutApp_installsInput>, reminder_usersUncheckedUpdateWithoutApp_installsInput>
  }

  export type reminder_usersUncheckedUpdateOneWithoutApp_installsNestedInput = {
    create?: XOR<reminder_usersCreateWithoutApp_installsInput, reminder_usersUncheckedCreateWithoutApp_installsInput>
    connectOrCreate?: reminder_usersCreateOrConnectWithoutApp_installsInput
    upsert?: reminder_usersUpsertWithoutApp_installsInput
    disconnect?: reminder_usersWhereInput | boolean
    delete?: reminder_usersWhereInput | boolean
    connect?: reminder_usersWhereUniqueInput
    update?: XOR<XOR<reminder_usersUpdateToOneWithWhereWithoutApp_installsInput, reminder_usersUpdateWithoutApp_installsInput>, reminder_usersUncheckedUpdateWithoutApp_installsInput>
  }

  export type reminder_usersCreateNestedOneWithoutReminder_contentInput = {
    create?: XOR<reminder_usersCreateWithoutReminder_contentInput, reminder_usersUncheckedCreateWithoutReminder_contentInput>
    connectOrCreate?: reminder_usersCreateOrConnectWithoutReminder_contentInput
    connect?: reminder_usersWhereUniqueInput
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type EnumReminderStatusFieldUpdateOperationsInput = {
    set?: $Enums.ReminderStatus
  }

  export type reminder_usersUpdateOneRequiredWithoutReminder_contentNestedInput = {
    create?: XOR<reminder_usersCreateWithoutReminder_contentInput, reminder_usersUncheckedCreateWithoutReminder_contentInput>
    connectOrCreate?: reminder_usersCreateOrConnectWithoutReminder_contentInput
    upsert?: reminder_usersUpsertWithoutReminder_contentInput
    connect?: reminder_usersWhereUniqueInput
    update?: XOR<XOR<reminder_usersUpdateToOneWithWhereWithoutReminder_contentInput, reminder_usersUpdateWithoutReminder_contentInput>, reminder_usersUncheckedUpdateWithoutReminder_contentInput>
  }

  export type reminder_contentCreateNestedManyWithoutReminder_usersInput = {
    create?: XOR<reminder_contentCreateWithoutReminder_usersInput, reminder_contentUncheckedCreateWithoutReminder_usersInput> | reminder_contentCreateWithoutReminder_usersInput[] | reminder_contentUncheckedCreateWithoutReminder_usersInput[]
    connectOrCreate?: reminder_contentCreateOrConnectWithoutReminder_usersInput | reminder_contentCreateOrConnectWithoutReminder_usersInput[]
    createMany?: reminder_contentCreateManyReminder_usersInputEnvelope
    connect?: reminder_contentWhereUniqueInput | reminder_contentWhereUniqueInput[]
  }

  export type app_installsCreateNestedOneWithoutReminder_usersInput = {
    create?: XOR<app_installsCreateWithoutReminder_usersInput, app_installsUncheckedCreateWithoutReminder_usersInput>
    connectOrCreate?: app_installsCreateOrConnectWithoutReminder_usersInput
    connect?: app_installsWhereUniqueInput
  }

  export type reminder_contentUncheckedCreateNestedManyWithoutReminder_usersInput = {
    create?: XOR<reminder_contentCreateWithoutReminder_usersInput, reminder_contentUncheckedCreateWithoutReminder_usersInput> | reminder_contentCreateWithoutReminder_usersInput[] | reminder_contentUncheckedCreateWithoutReminder_usersInput[]
    connectOrCreate?: reminder_contentCreateOrConnectWithoutReminder_usersInput | reminder_contentCreateOrConnectWithoutReminder_usersInput[]
    createMany?: reminder_contentCreateManyReminder_usersInputEnvelope
    connect?: reminder_contentWhereUniqueInput | reminder_contentWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type reminder_contentUpdateManyWithoutReminder_usersNestedInput = {
    create?: XOR<reminder_contentCreateWithoutReminder_usersInput, reminder_contentUncheckedCreateWithoutReminder_usersInput> | reminder_contentCreateWithoutReminder_usersInput[] | reminder_contentUncheckedCreateWithoutReminder_usersInput[]
    connectOrCreate?: reminder_contentCreateOrConnectWithoutReminder_usersInput | reminder_contentCreateOrConnectWithoutReminder_usersInput[]
    upsert?: reminder_contentUpsertWithWhereUniqueWithoutReminder_usersInput | reminder_contentUpsertWithWhereUniqueWithoutReminder_usersInput[]
    createMany?: reminder_contentCreateManyReminder_usersInputEnvelope
    set?: reminder_contentWhereUniqueInput | reminder_contentWhereUniqueInput[]
    disconnect?: reminder_contentWhereUniqueInput | reminder_contentWhereUniqueInput[]
    delete?: reminder_contentWhereUniqueInput | reminder_contentWhereUniqueInput[]
    connect?: reminder_contentWhereUniqueInput | reminder_contentWhereUniqueInput[]
    update?: reminder_contentUpdateWithWhereUniqueWithoutReminder_usersInput | reminder_contentUpdateWithWhereUniqueWithoutReminder_usersInput[]
    updateMany?: reminder_contentUpdateManyWithWhereWithoutReminder_usersInput | reminder_contentUpdateManyWithWhereWithoutReminder_usersInput[]
    deleteMany?: reminder_contentScalarWhereInput | reminder_contentScalarWhereInput[]
  }

  export type app_installsUpdateOneRequiredWithoutReminder_usersNestedInput = {
    create?: XOR<app_installsCreateWithoutReminder_usersInput, app_installsUncheckedCreateWithoutReminder_usersInput>
    connectOrCreate?: app_installsCreateOrConnectWithoutReminder_usersInput
    upsert?: app_installsUpsertWithoutReminder_usersInput
    connect?: app_installsWhereUniqueInput
    update?: XOR<XOR<app_installsUpdateToOneWithWhereWithoutReminder_usersInput, app_installsUpdateWithoutReminder_usersInput>, app_installsUncheckedUpdateWithoutReminder_usersInput>
  }

  export type reminder_contentUncheckedUpdateManyWithoutReminder_usersNestedInput = {
    create?: XOR<reminder_contentCreateWithoutReminder_usersInput, reminder_contentUncheckedCreateWithoutReminder_usersInput> | reminder_contentCreateWithoutReminder_usersInput[] | reminder_contentUncheckedCreateWithoutReminder_usersInput[]
    connectOrCreate?: reminder_contentCreateOrConnectWithoutReminder_usersInput | reminder_contentCreateOrConnectWithoutReminder_usersInput[]
    upsert?: reminder_contentUpsertWithWhereUniqueWithoutReminder_usersInput | reminder_contentUpsertWithWhereUniqueWithoutReminder_usersInput[]
    createMany?: reminder_contentCreateManyReminder_usersInputEnvelope
    set?: reminder_contentWhereUniqueInput | reminder_contentWhereUniqueInput[]
    disconnect?: reminder_contentWhereUniqueInput | reminder_contentWhereUniqueInput[]
    delete?: reminder_contentWhereUniqueInput | reminder_contentWhereUniqueInput[]
    connect?: reminder_contentWhereUniqueInput | reminder_contentWhereUniqueInput[]
    update?: reminder_contentUpdateWithWhereUniqueWithoutReminder_usersInput | reminder_contentUpdateWithWhereUniqueWithoutReminder_usersInput[]
    updateMany?: reminder_contentUpdateManyWithWhereWithoutReminder_usersInput | reminder_contentUpdateManyWithWhereWithoutReminder_usersInput[]
    deleteMany?: reminder_contentScalarWhereInput | reminder_contentScalarWhereInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EnumServerHealthFieldUpdateOperationsInput = {
    set?: $Enums.ServerHealth
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumAlgorithmFieldUpdateOperationsInput = {
    set?: $Enums.Algorithm
  }

  export type EnumHttpMethodFieldUpdateOperationsInput = {
    set?: $Enums.HttpMethod
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedEnumReminderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ReminderStatus | EnumReminderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReminderStatus[] | ListEnumReminderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReminderStatus[] | ListEnumReminderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReminderStatusFilter<$PrismaModel> | $Enums.ReminderStatus
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumReminderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReminderStatus | EnumReminderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReminderStatus[] | ListEnumReminderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReminderStatus[] | ListEnumReminderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReminderStatusWithAggregatesFilter<$PrismaModel> | $Enums.ReminderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumReminderStatusFilter<$PrismaModel>
    _max?: NestedEnumReminderStatusFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumServerHealthFilter<$PrismaModel = never> = {
    equals?: $Enums.ServerHealth | EnumServerHealthFieldRefInput<$PrismaModel>
    in?: $Enums.ServerHealth[] | ListEnumServerHealthFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServerHealth[] | ListEnumServerHealthFieldRefInput<$PrismaModel>
    not?: NestedEnumServerHealthFilter<$PrismaModel> | $Enums.ServerHealth
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumServerHealthWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServerHealth | EnumServerHealthFieldRefInput<$PrismaModel>
    in?: $Enums.ServerHealth[] | ListEnumServerHealthFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServerHealth[] | ListEnumServerHealthFieldRefInput<$PrismaModel>
    not?: NestedEnumServerHealthWithAggregatesFilter<$PrismaModel> | $Enums.ServerHealth
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumServerHealthFilter<$PrismaModel>
    _max?: NestedEnumServerHealthFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumAlgorithmFilter<$PrismaModel = never> = {
    equals?: $Enums.Algorithm | EnumAlgorithmFieldRefInput<$PrismaModel>
    in?: $Enums.Algorithm[] | ListEnumAlgorithmFieldRefInput<$PrismaModel>
    notIn?: $Enums.Algorithm[] | ListEnumAlgorithmFieldRefInput<$PrismaModel>
    not?: NestedEnumAlgorithmFilter<$PrismaModel> | $Enums.Algorithm
  }

  export type NestedEnumAlgorithmWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Algorithm | EnumAlgorithmFieldRefInput<$PrismaModel>
    in?: $Enums.Algorithm[] | ListEnumAlgorithmFieldRefInput<$PrismaModel>
    notIn?: $Enums.Algorithm[] | ListEnumAlgorithmFieldRefInput<$PrismaModel>
    not?: NestedEnumAlgorithmWithAggregatesFilter<$PrismaModel> | $Enums.Algorithm
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlgorithmFilter<$PrismaModel>
    _max?: NestedEnumAlgorithmFilter<$PrismaModel>
  }

  export type NestedEnumHttpMethodFilter<$PrismaModel = never> = {
    equals?: $Enums.HttpMethod | EnumHttpMethodFieldRefInput<$PrismaModel>
    in?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumHttpMethodFilter<$PrismaModel> | $Enums.HttpMethod
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumHttpMethodWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.HttpMethod | EnumHttpMethodFieldRefInput<$PrismaModel>
    in?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumHttpMethodWithAggregatesFilter<$PrismaModel> | $Enums.HttpMethod
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumHttpMethodFilter<$PrismaModel>
    _max?: NestedEnumHttpMethodFilter<$PrismaModel>
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type reminder_usersCreateWithoutApp_installsInput = {
    id?: string
    max_reminders?: number
    created_at?: Date | string
    reminder_content?: reminder_contentCreateNestedManyWithoutReminder_usersInput
  }

  export type reminder_usersUncheckedCreateWithoutApp_installsInput = {
    id?: string
    max_reminders?: number
    created_at?: Date | string
    reminder_content?: reminder_contentUncheckedCreateNestedManyWithoutReminder_usersInput
  }

  export type reminder_usersCreateOrConnectWithoutApp_installsInput = {
    where: reminder_usersWhereUniqueInput
    create: XOR<reminder_usersCreateWithoutApp_installsInput, reminder_usersUncheckedCreateWithoutApp_installsInput>
  }

  export type reminder_usersUpsertWithoutApp_installsInput = {
    update: XOR<reminder_usersUpdateWithoutApp_installsInput, reminder_usersUncheckedUpdateWithoutApp_installsInput>
    create: XOR<reminder_usersCreateWithoutApp_installsInput, reminder_usersUncheckedCreateWithoutApp_installsInput>
    where?: reminder_usersWhereInput
  }

  export type reminder_usersUpdateToOneWithWhereWithoutApp_installsInput = {
    where?: reminder_usersWhereInput
    data: XOR<reminder_usersUpdateWithoutApp_installsInput, reminder_usersUncheckedUpdateWithoutApp_installsInput>
  }

  export type reminder_usersUpdateWithoutApp_installsInput = {
    id?: StringFieldUpdateOperationsInput | string
    max_reminders?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    reminder_content?: reminder_contentUpdateManyWithoutReminder_usersNestedInput
  }

  export type reminder_usersUncheckedUpdateWithoutApp_installsInput = {
    id?: StringFieldUpdateOperationsInput | string
    max_reminders?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    reminder_content?: reminder_contentUncheckedUpdateManyWithoutReminder_usersNestedInput
  }

  export type reminder_usersCreateWithoutReminder_contentInput = {
    id?: string
    max_reminders?: number
    created_at?: Date | string
    app_installs?: app_installsCreateNestedOneWithoutReminder_usersInput
  }

  export type reminder_usersUncheckedCreateWithoutReminder_contentInput = {
    id?: string
    user_id?: string
    max_reminders?: number
    created_at?: Date | string
  }

  export type reminder_usersCreateOrConnectWithoutReminder_contentInput = {
    where: reminder_usersWhereUniqueInput
    create: XOR<reminder_usersCreateWithoutReminder_contentInput, reminder_usersUncheckedCreateWithoutReminder_contentInput>
  }

  export type reminder_usersUpsertWithoutReminder_contentInput = {
    update: XOR<reminder_usersUpdateWithoutReminder_contentInput, reminder_usersUncheckedUpdateWithoutReminder_contentInput>
    create: XOR<reminder_usersCreateWithoutReminder_contentInput, reminder_usersUncheckedCreateWithoutReminder_contentInput>
    where?: reminder_usersWhereInput
  }

  export type reminder_usersUpdateToOneWithWhereWithoutReminder_contentInput = {
    where?: reminder_usersWhereInput
    data: XOR<reminder_usersUpdateWithoutReminder_contentInput, reminder_usersUncheckedUpdateWithoutReminder_contentInput>
  }

  export type reminder_usersUpdateWithoutReminder_contentInput = {
    id?: StringFieldUpdateOperationsInput | string
    max_reminders?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    app_installs?: app_installsUpdateOneRequiredWithoutReminder_usersNestedInput
  }

  export type reminder_usersUncheckedUpdateWithoutReminder_contentInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    max_reminders?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type reminder_contentCreateWithoutReminder_usersInput = {
    id?: string
    title: string
    description?: string | null
    remind_at: Date | string
    status?: $Enums.ReminderStatus
    created_at: Date | string
    updated_at: Date | string
  }

  export type reminder_contentUncheckedCreateWithoutReminder_usersInput = {
    id?: string
    title: string
    description?: string | null
    remind_at: Date | string
    status?: $Enums.ReminderStatus
    created_at: Date | string
    updated_at: Date | string
  }

  export type reminder_contentCreateOrConnectWithoutReminder_usersInput = {
    where: reminder_contentWhereUniqueInput
    create: XOR<reminder_contentCreateWithoutReminder_usersInput, reminder_contentUncheckedCreateWithoutReminder_usersInput>
  }

  export type reminder_contentCreateManyReminder_usersInputEnvelope = {
    data: reminder_contentCreateManyReminder_usersInput | reminder_contentCreateManyReminder_usersInput[]
    skipDuplicates?: boolean
  }

  export type app_installsCreateWithoutReminder_usersInput = {
    id?: string
    user_id?: string | null
    device_id: string
    platform: string
    app_version?: string | null
    installed_at?: Date | string | null
    last_active?: Date | string | null
  }

  export type app_installsUncheckedCreateWithoutReminder_usersInput = {
    id?: string
    user_id?: string | null
    device_id: string
    platform: string
    app_version?: string | null
    installed_at?: Date | string | null
    last_active?: Date | string | null
  }

  export type app_installsCreateOrConnectWithoutReminder_usersInput = {
    where: app_installsWhereUniqueInput
    create: XOR<app_installsCreateWithoutReminder_usersInput, app_installsUncheckedCreateWithoutReminder_usersInput>
  }

  export type reminder_contentUpsertWithWhereUniqueWithoutReminder_usersInput = {
    where: reminder_contentWhereUniqueInput
    update: XOR<reminder_contentUpdateWithoutReminder_usersInput, reminder_contentUncheckedUpdateWithoutReminder_usersInput>
    create: XOR<reminder_contentCreateWithoutReminder_usersInput, reminder_contentUncheckedCreateWithoutReminder_usersInput>
  }

  export type reminder_contentUpdateWithWhereUniqueWithoutReminder_usersInput = {
    where: reminder_contentWhereUniqueInput
    data: XOR<reminder_contentUpdateWithoutReminder_usersInput, reminder_contentUncheckedUpdateWithoutReminder_usersInput>
  }

  export type reminder_contentUpdateManyWithWhereWithoutReminder_usersInput = {
    where: reminder_contentScalarWhereInput
    data: XOR<reminder_contentUpdateManyMutationInput, reminder_contentUncheckedUpdateManyWithoutReminder_usersInput>
  }

  export type reminder_contentScalarWhereInput = {
    AND?: reminder_contentScalarWhereInput | reminder_contentScalarWhereInput[]
    OR?: reminder_contentScalarWhereInput[]
    NOT?: reminder_contentScalarWhereInput | reminder_contentScalarWhereInput[]
    id?: UuidFilter<"reminder_content"> | string
    reminder_user_id?: UuidFilter<"reminder_content"> | string
    title?: StringFilter<"reminder_content"> | string
    description?: StringNullableFilter<"reminder_content"> | string | null
    remind_at?: DateTimeFilter<"reminder_content"> | Date | string
    status?: EnumReminderStatusFilter<"reminder_content"> | $Enums.ReminderStatus
    created_at?: DateTimeFilter<"reminder_content"> | Date | string
    updated_at?: DateTimeFilter<"reminder_content"> | Date | string
  }

  export type app_installsUpsertWithoutReminder_usersInput = {
    update: XOR<app_installsUpdateWithoutReminder_usersInput, app_installsUncheckedUpdateWithoutReminder_usersInput>
    create: XOR<app_installsCreateWithoutReminder_usersInput, app_installsUncheckedCreateWithoutReminder_usersInput>
    where?: app_installsWhereInput
  }

  export type app_installsUpdateToOneWithWhereWithoutReminder_usersInput = {
    where?: app_installsWhereInput
    data: XOR<app_installsUpdateWithoutReminder_usersInput, app_installsUncheckedUpdateWithoutReminder_usersInput>
  }

  export type app_installsUpdateWithoutReminder_usersInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    device_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    app_version?: NullableStringFieldUpdateOperationsInput | string | null
    installed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_active?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type app_installsUncheckedUpdateWithoutReminder_usersInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    device_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    app_version?: NullableStringFieldUpdateOperationsInput | string | null
    installed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_active?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type reminder_contentCreateManyReminder_usersInput = {
    id?: string
    title: string
    description?: string | null
    remind_at: Date | string
    status?: $Enums.ReminderStatus
    created_at: Date | string
    updated_at: Date | string
  }

  export type reminder_contentUpdateWithoutReminder_usersInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    remind_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumReminderStatusFieldUpdateOperationsInput | $Enums.ReminderStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type reminder_contentUncheckedUpdateWithoutReminder_usersInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    remind_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumReminderStatusFieldUpdateOperationsInput | $Enums.ReminderStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type reminder_contentUncheckedUpdateManyWithoutReminder_usersInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    remind_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumReminderStatusFieldUpdateOperationsInput | $Enums.ReminderStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}