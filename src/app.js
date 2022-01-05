const express = require('express');
const morgan = require('morgan');
const mysql = require('mysql');
const path = require('path');
const mysqlConnection = require('express-myconnection');
const flash = require('connect-flash');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

const products = require('./routes/productsRoutes');

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dbimages')));
app.use(express.static(path.join(__dirname, 'dbimages2')));

app.use(cookieParser('neotec'));

app.use(session({
    secret: 'neotec',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    app.locals.message = req.flash('message');
    next();
});

app.use(express.json());

app.use(morgan('dev'));

app.use(mysqlConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'neotec'
}, 'single'));


app.use(express.urlencoded({extended: false}));

app.use(products);

app.listen(app.get('port'), () => {
    console.log('Servidor en puerto 3000');
});