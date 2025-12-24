import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"
import orderRoutes from "./routes/orderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js"
import dashboardAdminRoutes from "./routes/dashboardAdminRoutes.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(cookieParser());

app.use(helmet());

const apiLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
})

app.get('/', (req, res) => {
    res.send("Welcome HomePage");
})
app.use('/api', apiLimiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/users', orderRoutes);
app.use('/api/users', notificationRoutes);

//Admin Routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin', dashboardAdminRoutes);

export default app