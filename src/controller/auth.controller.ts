import { Request, Response } from "express";
import { CreateSessionInput } from "../schema/auth.schema";
import { findUserByEmail } from "../services/user.service";
import { signAcessToken, signRefreshToken } from "../services/auth.service";

export async function createSessionHandler(
    req: Request<{}, {}, CreateSessionInput>,
    res: Response
) {

    const message = "Invalid email or password"

    const {email, password} = req.body

    const user = await findUserByEmail(email);

    if(!user) {
        res.send(message + "user404")
    }

    if(!user?.verified) {
        return res.send("Please verify your account");
    }

    const isValid = await user.validatePassword(password);

    if(!isValid) {
        return res.send(message + "invalidPass");
    }

    const acessToken = signAcessToken(user)

    const refreshToken = await signRefreshToken({ userId: String(user._id) });

    return res.send({
        acessToken,
        refreshToken
    });
}