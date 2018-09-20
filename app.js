const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session'); 
const mongoose = require('mongoose');

const app = express();

// DB config
const db = require('./config/database');

//map global promise to get rid of warning
mongoose.Promise = global.Promise;

//Connect to mongoose
mongoose.connect(db.mongoURI, { //useMongoClient: true,
useNewUrlParser: true  
}).then(function() {console.log('**MongoDB connected...')
}).catch(err => console.log(err));

//Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

//middleware handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//body-parser middleware copied from documentation
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//middlewear method-override
app.use(methodOverride('_method'));

//middleware connect-express
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  //cookie: { secure: true }  --not needed
}));

//middleware connect-flash
app.use(flash());

//Global variables for middleware
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');  //general message
  next();
});

//Index route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

//About route
app.get('/about', (req, res) => {
  res.render('about');
});

//Idea index route
app.get('/ideas', (req, res) => {
  Idea.find({})
  .sort({date: 'desc'})
  .then(ideas => {
    res.render('ideas/index', {
      ideas: ideas
    });
  });
});

//Add Idea form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add');
});


//Edit Idea route
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({_id: req.params.id })
  .then(idea => {
    res.render('ideas/edit', {
      idea: idea
    });
  });
});


//Process Form
app.post('/ideas', (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({text: 'Please add a title'});
  }
  if (!req.body.details) {
    errors.push({text: 'Please add some details'})
  }
  
  if (errors.length > 0) {
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    //save to the database mongoose model
    const newUser = {
      title: req.body.title,
      details: req.body.details
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Item has been added!');
        res.redirect('./ideas');
      })
  }

});

//Edit form process
app.put('/ideas/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    //new values
    idea.title = req.body.title;
    idea.details = req.body.details;

    idea.save()
    .then(idea => {
      req.flash('success_msg', 'Item has been Edited!');
      res.redirect('/ideas');
    });
  });
});

//Delete Idea
app.delete('/ideas/:id', (req, res) => {
  Idea.remove({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Item has been removed!');
      res.redirect('/ideas');
    });
  });


const port = process.env.PORT || 5000;

app.listen(port, function() {
  console.log(`**!server started on ${port}`);
});