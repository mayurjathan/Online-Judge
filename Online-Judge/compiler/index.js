const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 5100;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log(" Connected to MongoDB from compiler");
  // Routes
  const compileRoute = require("./routes/compile");
  app.use("/api/compiler", compileRoute);

  const submitRoute = require("./routes/submit");
  app.use("/api/compiler/submit", submitRoute);

  // Start server
  app.listen(port, () => {
    console.log(`Compiler server running at http://localhost:${port}`);
  });
})
.catch((err) => {
  console.error("MongoDB connection error:", err.message);
});
