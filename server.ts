import { app } from "./app";
import { connectToDB } from "./utils/connection";
require('dotenv').config();



app.listen(process.env.PORT,()=>{
    console.log('server connected to ', process.env.PORT);
    connectToDB();
})