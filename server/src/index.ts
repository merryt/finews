import { MikroORM } from "@mikro-orm/core";
import { Post } from "./entities/Posts";
import mikroConfig from './mikro-orm.config';
import express from 'express'



const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    
    // write to DB
    // const post = orm.em.create(Post, {title: "my first post"});
    // orm.em.persistAndFlush(post);

    // read from DB
    // const posts = await orm.em.find(Post, {});
    // console.log(posts)

    const app = express();
    app.get('/', (_req, res) => {
        res.send("hello")
    });

    app.listen(4000, ()=>{
        console.log('server started on port 4000')
    });
}

main().catch(err=> console.error(err));