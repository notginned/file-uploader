import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import session from "express-session";
import { PrismaClient } from "../../generated/prisma/client.js";

export const sessionWare = session({
  cookie: {
    // days * hours * minutes * seconds * milliseconds
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  secret: "cat on a keyboard",
  resave: true,
  saveUninitialized: true,
  store: new PrismaSessionStore(new PrismaClient(), {
    // hours * minutes * seconds
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
});
