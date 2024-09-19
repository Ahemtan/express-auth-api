import { object, string, TypeOf } from "zod";

export const createSessionSchema = object({
    body: object({
        email: string({ required_error: "email is required"}).email(),
        password: string({ required_error: "password is required"}).min(6, "Invalid email or password"),
    })
})

export type CreateSessionInput = TypeOf<typeof createSessionSchema>["body"];