import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../../models/user.js";
import { compare } from "bcrypt";

export const strat = new LocalStrategy(async (username, password, done) => {
  const user = await User.findByUsername({ username });

  // Incorrect username
  if (user === null)
    return done(null, false, { message: "Username or password is incorrect" });

  const comparisonResult = await compare(password, user.password);

  // Incorrect password
  if (!comparisonResult)
    return done(null, false, { message: "Username or password is incorrect" });

  return done(null, user);
});

const authMiddleware = passport.use(strat);

export { authMiddleware };
