require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for Passport
app.use(session({
    secret: process.env.JWT_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Google Strategy Setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: "/api/users/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }
        
        let userByEmail = await User.findOne({ email: profile.emails[0].value });
        
        if (userByEmail) {
          userByEmail.googleId = profile.id;
          userByEmail.profilePicture = profile.photos[0].value;
          await userByEmail.save();
          return done(null, userByEmail);
        }

        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        console.error("Google auth error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const foundUser = await User.findById(id);
    done(null, foundUser);
  } catch (err) {
    done(err, null);
  }
});

// Routes
app.use('/api/users', require('./routes/UserRoute'));
app.use('/api/expenses', require('./routes/ExpenseRoute'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
}); 
app.get("/",(req,res)=>{
  res.send("Hii mom")
})

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;
const start = async () => {
    try {
        // Skip DB connection if URI is placeholder
        if (process.env.MONGO_URI && process.env.MONGO_URI !== 'your_mongodb_connection_string') {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('Connected to Database');
        } else {
            console.log('MONGO_URI is missing or default. Please update .env to connect to real DB.');
        }
        
        app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
};

start();
