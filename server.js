//Creating express app
const express = require('express');
const app = express();

//Using express-static middleware
app.use(express.static('public'));

//Start listening
app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));