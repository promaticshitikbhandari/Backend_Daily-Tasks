import connectDB from "./src/config/db.js";
import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config({
    path: './.env'
})

const port = process.env.PORT || 8000;

connectDB()
.then( () => {
    app.listen(port, () => {
        console.log(`Server running at port: ${port}`);
    })
})
.catch( (error) => {
    console.log(`MongoDB connection Failed !!! ${error}`)
})
