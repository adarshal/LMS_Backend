import { app } from "./app";
require('dotenv').config();



app.listen(process.env.PORT,()=>{
    console.log('server connected to ', process.env.PORT);
    
})