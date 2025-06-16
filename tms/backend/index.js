import express from "express";
import cors from "cors";
import session from "express-session";
import dontenv from "dotenv";
import SequelizeStore from "connect-session-sequelize";
import ItRoute from "./routes/ItRoute.js";
import KaryawanRoute from "./routes/KaryawanRoute.js";
import PekerjaKreatifRoute from "./routes/PekerjaKreatifRoute.js"
import AuthRoute from "./routes/AuthRoute.js";
import portofolio from "./routes/portofolio.js";
import db from "./config/Database.js";
import "./cron/UpdateTalentStatus.js";

dontenv.config();

const app = express();


app.set("trust proxy", 1);

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
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 12
    }
}));

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
}));

// 🔧 Tambahkan ini setelah cors():
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});


app.use(express.json());
app.use(AuthRoute);
app.use(ItRoute);
app.use(KaryawanRoute);
app.use(PekerjaKreatifRoute);
app.listen(process.env.APP_PORT, () => console.log('Server up and running...' + new Date().toString()));