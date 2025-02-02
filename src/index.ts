import express, { Request, Response } from "express";

const app = express();

app.get("/", (_req: Request, res: Response) => {
  res.sendStatus(200);
});

app.listen(3001, "localhost", () => {
  console.log("Score server is listening on post 3001");
});
