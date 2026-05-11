# Getting started

---

## Create your NestJS project

### Install NestJS CLI

```
npm install -g @nestjs/cli
```

### Create your app skeleton

```
nest new lms-backend
```

Your terminal will look like below, you can choose which you want, for convinient, you should use `npm` as me.

```
✨  We will scaffold your app in a few seconds..

? Which package manager would you ❤️  to use?
❯ npm
yarn
pnpm
```

### Check if your is running

```
cd lms-backed
npm run start
```

If success, you will see this in your termial
![nest_app_run_success](/docs/images/nest_app_run_success.png)

## Set up Prisma

Prisma is an open-source ORM for Node.js and TypeScript.

### Install the Prisma CLI as development dependency in your project (make sure you are in your project foler):

```
npm install prisma --save-dev
```

In the following steps, we'll be utilizing Prisma CLI. As a best practice, it's recommended to invoke the CLI locally by prefixing it with `npx`:

```
npx prisma
```

### Create your initial Prisma set up using the `init` command of the Prisma CLI

```
npx prisma init
```

This command creates a new `prisma` directory with the following contents:

- `schema.prisma`: Specifies your database connection and contains the database schema
- `prisma.config.ts`: A configuration file for your projects
- `.env`: A **dotenv** file, used to store your environment variables. To read environment variables, you need to install the `dotenv` dependency using this command `npm install dotenv`

### Config the module format

In `schema.prisma`file, set the `moduleFormat` in the generator to `cjs`:

```
generator client {
    provider        = "prisma-client"
    output          = "../src/generated/prisma"
    moduleFormat    = "cjs"
}
```

_Note: The `moduleFormat` configuration is required because Prisma v7 ships as an ES module by default, which does not work with NestJS's CommonJS setup._

### Set the database connection

Your database connection is configured in the `datasource` block in `schema.prisma` file

```
datasource db {
    provider = "postgresql"
}

generator client {
    provider = "prisma-client"
    output          = "../src/generated/prisma"
    moduleFormat  = "cjs"
}
```

In your `.env` file

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"
```

Replace the place holders spelled in all uppercase letters with your database credentials. (See the next step for details)

## Set up a PostgreSQL database using Docker Compose

### Create a `docker-compose.yaml` file

In the same directory as your `.env` file, create `docker-compose.yaml` file:

```yml
services:
  postgres:
    image: postgres:16
    container_name: postgres_db

    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - '${DB_PORT}:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

The environment variables are in your `.env` file. Don't forget to fix the `DATABASE_URL` to match with your created database above.

### Start the database

At the folder contains `docker-compose.yaml`, run the following command:

```
docker-compose up -d
```

You can check the result in your Docker Desktop.

## Prisma Migration

We use Prisma Migrate to migrate your schema in a development.

Prisma Migrate generates SQL migration files for your declarative data model definition in the Prisma schema.

### Add some models to your `schema.prisma`:

```
model User {
  id    Int     @default(autoincrement()) @id
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @default(autoincrement()) @id
  title     String
  content   String?
  published Boolean? @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```

### Create an initial migration

Create an initial migration using the `prisma migrate` command:

```
npx prisma migrate dev --name init
```

This `prisma migrate dev` command generates SQL files and directly runs them against the database.

The migration files is created in the exisiting `prisma` directory:

```
$ tree prisma
prisma
├── dev.db
├── migrations
│   ├── 20201207100915_init
│   │     └── migration.sql
│   └── 20210313140442_added_job_title
│         └── migration.sql
└── schema.prisma
```

### Install and generate Prisma Client

Prisma Client is Prisma ORM's generated query builder. It is tailored to your schema, fully typed, and designed to make common database work feel like ordinary application code.

- What Prisma Client gives you
  - Typed query methods based on your models
  - Autocomplete for filters, relations, ordering, and nested writes
  - Predictable plain JavaScript objects as query results
  - A single client API that works across PostgreSQL, MySQL, SQLite, MongoDB, and more

- Install Prisma Client in your project

  ```
  npm install @prisma/client
  ```

- Once installed, run the `generate` command to generates the types and Client needed for the project:

  ```
  npx prisma generate
  ```

  You should run prisma generate after:
  - changing your Prisma schema
  - updating generator configuration
  - enabling features that affect the client API
  - pulling schema changes from another branch or teammate

- In addition to Prisma Client, you also need a driver adapter for the type of database you are working with. For PostgreSQL:
  ```
  npm install @prisma/adapter-pg
  npm install pg
  npm install -D @types/pg
  ```

## Prisma studio

Prisma Studio is a visual editor for your database. Launch it with:

```
npx prisma studio
```

## Test what we have done

- Create a `test-set-up.ts` file in `src` directory to test your set up:

  ```typescript
  import 'dotenv/config';
  import { PrismaPg } from '@prisma/adapter-pg';
  import { PrismaClient } from './generated/prisma/client';
  import { Pool } from 'pg';

  const prisma = new PrismaClient({
    adapter: new PrismaPg(
      new Pool({ connectionString: process.env.DATABASE_URL }),
    ),
  });

  async function main() {
    // create user
    const user = await prisma.user.create({
      data: {
        email: 'test@gmail.com',
        name: 'John',
      },
    });

    console.log(user);

    // get users
    const users = await prisma.user.findMany();

    console.log(users);
  }

  main()
    .catch(console.error)
    .finally(async () => {
      await prisma.$disconnect();
    });
  ```

- Run the script:

  ```
  npx tsx src/test-set-up.ts
  ```

- Result in terminal

  ```
  { id: 1, email: 'test@gmail.com', name: 'John' }
  [ { id: 1, email: 'test@gmail.com', name: 'John' } ]
  ```

- Check in Prisma studio, you will see a record in User table

  ![prisma_studio_test](/docs/images/prisma_studio_test.png)

## Use Prisma Client in your NestJS services

You're now able to send database queries with Prisma Client.

When setting up your NestJS application, you'll want to abstract away the Prisma Client API for database queries within a service. To get started, you can create a new `PrismaService` that takes care of instantiating `PrismaClient` and connecting to your database.

Inside the src directory, create a new file called prisma.service.ts and add the following code to it:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg(
      new Pool({ connectionString: process.env.DATABASE_URL }),
    );
    super({ adapter });
  }
}
```

---

# Read more in

---

- [Prisma | NestJS Docs](https://docs.nestjs.com/recipes/prisma)
- [Prisma Postgres | Prisma Docs](https://www.prisma.io/docs/prisma-orm/quickstart/prisma-postgres)
- [Generating Prisma Client | Prisma Docs](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client)
