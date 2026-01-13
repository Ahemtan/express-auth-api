import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

export function setupSwagger(app: Express) {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: { title: "Auth API", version: "1.0.0" },
      components: {
        schemas: {
          // Auth schemas
          CreateSessionInput: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", example: "user@example.com" },
              password: { type: "string", example: "StrongP@ssw0rd" },
            },
          },
          RefreshSessionResponse: {
            type: "object",
            properties: {
              csrfToken: { type: "string", example: "newCsrfToken123" },
            },
          },

          // User schemas
          CreateUserInput: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", example: "user@example.com" },
              password: { type: "string", example: "StrongP@ssw0rd" },
            },
          },
          VerifyUserInput: {
            type: "object",
            properties: {
              email: { type: "string", example: "user@example.com" },
            },
          },
          ForgetPasswordInput: {
            type: "object",
            properties: {
              email: { type: "string", example: "user@example.com" },
            },
          },
          ResetPasswordInput: {
            type: "object",
            required: ["newPassword"],
            properties: {
              newPassword: { type: "string", example: "NewStrongP@ssw0rd" },
            },
          },
          UserResponse: {
            type: "object",
            properties: {
              id: { type: "string", example: "uuid-user-id" },
              email: { type: "string", example: "user@example.com" },
              verified: { type: "boolean", example: true },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2026-01-13T12:00:00Z",
              },
            },
          },
        },
        securitySchemes: {
          csrfToken: {
            type: "apiKey",
            in: "header",
            name: "x-csrf-token",
          },
        },
      },
    },
    apis: ["./src/routes/*.ts"], // make sure this path matches your project
  };

  const specs = swaggerJSDoc(options);
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));
}
