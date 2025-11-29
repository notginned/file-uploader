import "./utils/loadEnv.js";
import express, { urlencoded } from "express";
import { indexRouter } from "./routes/index.js";
import { resolve } from "node:path";
import { authRouter } from "./routes/user.js";
import { sessionWare } from "./config/auth/session.js";
import { authMiddleware } from "./config/auth/auth.js";
import { isAuthenticated, loginPost } from "./controllers/user.js";
import { fileRouter } from "./routes/file.js";

const app = express();
const PORT = 8080;

// view engine setup
app.set("view engine", "ejs");
app.set("views", resolve(import.meta.dirname, "views"));

app.use(urlencoded({ extended: false }));

// Sessions using prisma session store
app.use(sessionWare);
app.use(authMiddleware.authenticate("session"));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// routes
app.use("/", indexRouter);

// User routes
app.use("/sign-up", authRouter);
app.post("/login", loginPost);
app.get("/logout", (req, res, next) =>
  req.logOut((err) => {
    if (err) return next(err);

    res.redirect("/");
  }),
);
app.use("/drive", isAuthenticated, fileRouter);

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
