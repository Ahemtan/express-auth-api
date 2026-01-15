import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

export function setupSwagger(app: Express) {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Session-based Auth API",
        version: "1.0.0",
        description: "User & session management with device tracking",
      },

      tags: [
        { name: "Sessions", description: "Login, logout, refresh, devices" },
        { name: "Users", description: "User account lifecycle" },
      ],

      components: {
        securitySchemes: {
          csrfToken: {
            type: "apiKey",
            in: "header",
            name: "x-csrf-token",
          },
        },

        schemas: {
          /* =====================
             SESSION SCHEMAS
          ====================== */

          CreateSessionInput: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", example: "user@example.com" },
              password: { type: "string", example: "StrongP@ssw0rd" },
            },
          },

          SessionResponse: {
            type: "object",
            properties: {
              id: { type: "string", example: "session-uuid" },
              deviceName: { type: "string", example: "MacBook Pro" },
              ip: { type: "string", example: "192.168.1.1" },
              lastActiveAt: {
                type: "string",
                format: "date-time",
              },
              createdAt: {
                type: "string",
                format: "date-time",
              },
              expiresAt: {
                type: "string",
                format: "date-time",
              },
            },
          },

          RefreshSessionResponse: {
            type: "object",
            properties: {
              accessToken: {
                type: "string",
                example: "new.jwt.access.token",
              },
            },
          },

          /* =====================
             USER SCHEMAS
          ====================== */

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
            required: ["verificationCode"],
            properties: {
              verificationCode: {
                type: "string",
                example: "uuid-verification-code",
              },
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
            required: ["password"],
            properties: {
              password: {
                type: "string",
                example: "NewStrongP@ssw0rd",
              },
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
              },
            },
          },
        },
      },
    },

    // Auto-load docs from route files
    apis: ["./src/routes/*.ts"],
  };

  const specs = swaggerJSDoc(options);
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));
}
