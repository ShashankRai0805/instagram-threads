const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const router = require("./routes");

dotenv.config();
const app = express();
connectDB();

app.use(express.json());
app.use("/api", router)

const port = process.env.PORT;
app.listen(port, function(){
    console.log(`Server is running on port ${port}`);
});