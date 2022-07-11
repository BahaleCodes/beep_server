const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config();

const app = express();

// db
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true
  })
  .then(() => console.log('DB Connected'));

// app
app.get('/', (req, res) => {
  res.send("The shit works!!!");
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});