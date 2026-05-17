import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DATABASE_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),

  JWT_ACCESS_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRES: Joi.string().default(900), // 15 minutes in seconds
  JWT_REFRESH_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRES: Joi.string().default(604800), // 7 days in seconds
});
