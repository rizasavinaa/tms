// const express   = require('express');
// const {engine} = require('express-handlebars');
// const app = express();
// const port = process.env.PORT|| 3000;
// const router = require('./src/routes/index');
// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
// app.use(express.static('public'));
// app.engine('handlebars',engine());
// app.set('view engine', 'handlebars');
// app.set("views", "./views");
// app.use('/', router);

// app.get('/',(req, res)=>{
//     res.render('home')
// })

// app.listen(port, ()=>{
//     console.log(`The server is listening on port ${port}`)
// })
const path = require('path');

const express = require('express');

const blogRoutes = require('./src/routes/index');
const methodOverride = require('method-override');
const { listenerCount } = require('process');

const app = express();

//activate ejs view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));//parse incoming request bodies
app.use(express.static('public')); //serve static files

app.use(blogRoutes);

app.use(function (error, req, res, next){
    //default error handling function
    //will becomee active whenever any route/middleware crashes
    console.log(error);
    res.status(500).render('500');
});

app.listen(3000);