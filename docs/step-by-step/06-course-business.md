# Course module

---

## Flow

Instructor create course flow:

```
Create Draft
    ↓
Edit course
    ↓
Add sections
    ↓
Add lessons
    ↓
Validate course
    ↓
Publish
    ↓
Students can enroll
```

## `courses` directory

```
src/modules/courses/

  controllers/
    instructor-courses.controller.ts

  services/
    course-command.service.ts       // write/update business logic
    course-query.service.ts         // read data
    course-validation.service.ts    // business validation

  dto/
    create-course.dto.ts
    update-course.dto.ts
    query-course.dto.ts

  repositories/
    course.repository.ts

  mappers/
    course.mapper.ts

  courses.module.ts
```

Use a repository layer is useful in: cache, optimization, query reuse, transaction, testing

## Slug generation

- Install:

```
npm install slugify
```

- Create `generateSlug()` function in [`generate-slug.ts`](/src/common/utils/generate-slug.ts)

```typescript
import slugify from 'slugify';

export function generateSlug(title: string) {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });
}
```

## Business actions

### Create draft course

- `CreateDaft()`to create draft course in [`course-command.service.ts`](/src/modules/courses/services/course-command.service.ts)
- Then create `@Post()` in [`instructor-courses.controller.ts`](/src/modules/courses/controllers/instructor-courses.controller.ts)

### Update OWN course

- `updateCourse()` to update course in [`course-command.service.ts`](/src/modules/courses/services/course-command.service.ts)
- Then create `@Post('id')` in [`instructor-courses.controller.ts`](/src/modules/courses/controllers/instructor-courses.controller.ts)

### Publish course

- Validate couse before publish in [`course-validation.service.ts`](/src/modules/courses/services/course-validation.service.ts)
- Logic to publish course in [`course-command.service.ts`](/src/modules/courses/services/course-command.service.ts)

### Archive course

### View OWN courses
