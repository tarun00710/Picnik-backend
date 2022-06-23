const express = require('express');
const App = express();
const { ConnectionDB } = require('./Connection');
const port = process.env.PORT || 5000;
const fileupload = require('express-fileupload')

ConnectionDB();

const bodyParser = require('body-parser');

App.use(fileupload({
    useTempFiles:true
}))
App.use(bodyParser.json())

App.get('/',(req,res) => res.send("hello peeps"))


const userRoutes = require('./Routes/userRoutes')
App.use('/users',userRoutes)
const userActionRoutes = require('./Routes/userActionRoute')
App.use('/useraction',userActionRoutes)

App.listen(port,()=>console.log("successfully connected to PORT",port))




