import express from "express";
import cors from "cors";
import session from "express-session";
import dontenv from "dotenv";
import SequelizeStore from "connect-session-sequelize";
import UserRoute from "./routes/UserRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import db from "./config/Database.js";

dontenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db
});


app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        secure: false, // Set `true` jika pakai HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 12 // 12 jam
    }
}));

app.use(cors({
    credentials: true,
    origin : "http://localhost:3000"
}));
app.use(express.json());
app.use(UserRoute);
app.use(AuthRoute);


app.listen(process.env.APP_PORT, ()=> console.log('Server up and running...'+new Date().toString()));