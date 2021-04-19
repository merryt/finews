import { Connection, IDatabaseDriver, MikroORM } from "mikro-orm";

export type MyContext {
    em: MikroORM<IDatabaseDriver<Connection>>
}