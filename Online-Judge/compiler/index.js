const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); 
const compileRoute = require("./routes/compile");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;


app.use(cors());
app.use(express.json());
app.use("/api/compiler", compileRoute);

app.listen(PORT, () => {
  console.log(`Compiler server running at http://localhost:${PORT}`);
});
