# Database design

---

## ERD

![See ERD](/docs/erd/Entity%20Relationship%20Diagram.png)

## Prisma schema

[See prisma schema](/prisma/schema.prisma)

## Migration

Before applying migrations, we need reset the database (because we have created some data before, this will make errors when migrating) using the following command:

```
npx prisma migrate reset
```

Now, apply migration (you can typed any name you want)

```
npx prisma migrate dev --name init_core_lms_tables
```
