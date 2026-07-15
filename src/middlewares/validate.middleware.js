import { AppError } from '../errors/AppError.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400,
      );
    }

    console.log(result.data);
    req.body = result.data;

    next();
  };
};
