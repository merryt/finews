import { Post } from "./entities/Posts";
import { __is_prod__} from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';

export default {
    migrations:{
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    dbName: "finews", 
    user: 'postgres',
    password: 'postgres',
    debug: !__is_prod__,
    type: 'postgresql',
    entities:[Post],
    port: 5434,
} as Parameters<typeof MikroORM.init>[0];