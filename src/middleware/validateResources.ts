import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

const validateResource =
  ({ body, query, params }: ValidationSchemas) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (body) body.parse(req.body);
      if (query) query.parse(req.query);
      if (params) params.parse(req.params);
      next();
    } catch (err: any) {
      return res.status(400).json({
        errors: err.errors.map((e: any) => ({
          field: e.path.join(".") || "(root)",
          message: e.message,
        })),
      });
    }
  };

export default validateResource;
