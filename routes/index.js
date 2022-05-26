const express = require('express');
const router = express.Router({mergeParams: true});
const passport = require('passport');
const User = require('../models/user');
const Notification = require('../models/notification');
const middleware = require('../middleware');

router.get('/',(req,res)=>{
    res.render('landing');
});

// show register form
router.get('/register', (req,res)=>{
    res.render('register');
});

// handle signup logic
router.post('/register',(req,res)=>{
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error",err.message);
            return res.render('register');
        }
        passport.authenticate('local')(req,res,function(){
            req.flash("success","Welcome to Yelpcamp "+user.username);
            res.redirect('/campgrounds');
        });
    });
});

// show login form
router.get('/login', (req,res)=>{
    res.render('login');
});

// handle login logic
router.post('/login', passport.authenticate("local",{
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function(req,res){

});

// logout login
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect('/campgrounds');
});

//user profile
router.get('/users/:id', async function(req,res){
    try{
        let user = await User.findById(req.params.id).populate('followers').exec();
        res.render('profile', { user });
    } catch(err){
        req.flash('error', err.message);
        return res.redirect('back');
    }
});

// follow user
router.get('/follow/:id', middleware.isLoggedIn, async function(req,res){
    try{
        let user = await User.findById(req.params.id);
        user.followers.push(req.user._id);
        user.save();
        req.flash('success','Successfully followed' + user.username + '!');
        res.redirect('/users/'+req.params.id);
    } catch(err){
        req.flash('error',err.message);
        res.redirect('back');
    }
});

// view all notifications
router.get('/notifications', middleware.isLoggedIn, async function(req, res) {
    try {
      let user = await User.findById(req.user._id).populate({
        path: 'notifications',
        options: { sort: { "_id": -1 } }
      }).exec();
      let allNotifications = user.notifications;
      res.render('notifications/index', { allNotifications });
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });
  
  // handle notification
  router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
    try {
      let notification = await Notification.findById(req.params.id);
      notification.isRead = true;
      notification.save();
      res.redirect(`/campgrounds/${notification.campgroundId}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });
  
module.exports = router;