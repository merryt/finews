import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query
  ObjectType,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { MyContext } from "../types";
import { User } from "../entities/User";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Query(()=> [User])
  users(@Ctx() { em }: MyContext){
    return em.find(User, {})
  }


  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "That username isn't going to cut it.",
          },
        ],
      };
    }
    if (options.password.length <= 4) {
      return {
        errors: [
          {
            field: "password",
            message: "That password is weak sauce",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username.toLowerCase(),
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "That user is already taken, could you try again",
            },
          ],
        };
      } else {
        return {
          errors: [
            {
              field: "unsure",
              message: error.message,
            },
          ],
        };
      }
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: options.username.toLowerCase(),
    });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Username not found, maybe check for spelling",
          },
        ],
      };
    }

    const validPassword = await argon2.verify(user.password, options.password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "Big oooph, password isn't exactly right",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }
}
