const express = require('express');
const app = new express();
const dotenv = require('dotenv').config();

const passport = require('passport');
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const parser = require('body-parser');
const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://employee:employee@localhost:5433/office'});
const bookshelf = require('bookshelf');
const securePassword = require('bookshelf-secure-password');
const db = bookshelf(knexDb);
db.plugin(securePassword);
const jwt = require('jsonwebtoken');

const User = db.Model.extend({
    tableName: 'user',
    hasSecurePassword: true
});

// const Staff = db.Model.extend({
//     tableName: 'staffs',
// });

// const Department = db.Model.extend({
//     tableName: 'departments'
// });

// const Location = db.Model.extend({
//     tableName: 'locations'
// });

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_OR_KEY
};

const strategy = new JwtStrategy(opts, (payload, next) => {
    const user = User.forge({id: payload.id}).fetch().then(result => {
        next(null, result);
    });   
});

passport.use(strategy);
app.use(passport.initialize());
app.use(parser.urlencoded({
    extended: false
}));
app.use(parser.json());

app.get('/', (req, res) => {
    res.send('Helll world');
});

app.post('/signup', (req, res) => {
    if(!req.body.email || !req.body.password){
        return res.status(401).send('no field');
    }

    User.forge({email: req.body.email}).fetch().then(result => {
        if(result){
            return res.status(409).json({success: false, message: 'The user is already existed'});
        }
        
        const user = new User({
            email: req.body.email,
            password: req.body.password
        });
        user.save().then(() => {
            return res.status(201).json({success: true, User: user});
        });   
    });    
});

// issue a token when login
app.post('/login', (req, res) => {
    if(!req.body.email || !req.body.password){
        return res.status(401).send('no field');
    }

    User.forge({email: req.body.email}).fetch().then(result => {
        if(!result){
            return res.status(400).json({success: false, message: 'The user is not found'});
        }

        result.authenticate(req.body.password).then(user => {
            const payload = { id: user.id};
            const token = jwt.sign(payload, process.env.SECRET_OR_KEY, {expiresIn : '1d'});
            return res.status(200).json({success: true, user: user, token: token});
        }).catch(err => {
            return res.status(401).json({success: false, message: 'err'});
        });
    });
});

app.get('/protected', passport.authenticate('jwt', {session: false}), (req, res) => {
    return res.status(200).json({success: true, message: 'This is protected'});
});

const PORT =process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

