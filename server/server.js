import  express  from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import { DATABASE } from "./config.js";
import authRoutes from "./routes/auth.js";
import adRoutes from "./routes/ad.js";

const app= express();

//DB
mongoose.set("strictQuery", false);
mongoose
    .connect(DATABASE)
    .then(() => console.log("db_connected"))
    .catch((err) => console.log(err));

//middlewares
app.use(express.json({limit: "10mb"}));// to apply middleware to app to receive value from server
app.use(morgan("dev"));
app.use(cors());

//routes middleware
app.use('/api', authRoutes);
app.use('/api', adRoutes);

//express is a request to response handler
//for every request there is a response


app.listen(8000, () => console.log("server_running_on_port_8000"));//for using this port number