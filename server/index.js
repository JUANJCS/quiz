const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/data", express.static(path.join(__dirname, "..", "data")));
app.get("/healthz", (_, res) => res.type("text").send("ok"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TQUIZ running → http://localhost:${PORT}`));