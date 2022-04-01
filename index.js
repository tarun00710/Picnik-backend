const express = require('express');
const App = express();
const { ConnectionDB } = require('./Connection');
const port = process.env.PORT || 5000;


ConnectionDB();

const bodyParser = require('body-parser');


App.use(bodyParser.json())

App.get('/',(req,res) => res.send("hello people"))


const userRoutes = require('./Routes/userRoutes')
App.use('/user',userRoutes)
const userActionRoutes = require('./Routes/userActionRoute')
App.use('/useraction',userActionRoutes)

App.listen(port,()=>console.log("successfully connected to PORT",port))




