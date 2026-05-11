import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DATABASE_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
});
