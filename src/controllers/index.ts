import { RequestHandler } from "express";

const indexGet: RequestHandler = (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/drive");

  return res.render("index");
};

export { indexGet };
