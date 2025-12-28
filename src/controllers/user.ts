import { RequestHandler } from "express";
import { body, ValidationChain, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import { authMiddleware } from "../config/auth/auth.js";
import { supabase } from "../utils/db.js";

const validateUser: ValidationChain[] = [
    body("username").trim().escape().isLength({ min: 3, max: 25 }),
    body("password").isLength({ min: 3 }),
];

const signUpGet: RequestHandler = (req, res) => {
    res.render("sign-up");
};

const signUpPostHandler: RequestHandler = async (req, res) => {
    const result = validationResult(req);

    // sad path D:
    if (!result.isEmpty()) {
        return res.render("sign-up", { errors: result.array() });
    }

    // happy path :D
    const { username, password } = req.body;
    const numRounds = 10;

    const hashedPass = await bcrypt.hash(password, numRounds);

    const { id } = await User.create({
        data: {
            username,
            password: hashedPass,
        },
    });

    const userStorage = await supabase.storage.createBucket(id.toString());
    console.log("created storage", userStorage);

    return res.redirect("/");
};

const signUpPost = [...validateUser, signUpPostHandler];

const loginPost = [
    ...validateUser,
    authMiddleware.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/",
    }),
];

const isAuthenticated: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    res.render("index", { errors: [{ message: "User not logged in" }] });
};

export { signUpGet, signUpPost, loginPost, isAuthenticated };
