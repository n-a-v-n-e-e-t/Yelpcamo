const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const middleware = require('../middleware');
const User = require('../models/user');
const Notification = require('../models/notification');
const multer = require('multer');
const cloudinary = require('cloudinary');
require('dotenv').config()

var storage = multer.diskStorage({
    filename: function(req, file, callback) {
      callback(null, Date.now() + file.originalname);
    }
  });
  var imageFilter = function (req, file, cb) {
      // accept image files only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
  };
  var upload = multer({ storage: storage, fileFilter: imageFilter})
  
  cloudinary.config({ 
    cloud_name: 'dcxsizdmo', 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

router.get('/', (req,res)=>{
    Campground.find({},(err, foundCampgrounds)=>{
        if(err){
            req.flash('error',"Couldn't find Campgrounds");
            res.redirect('back');
        } else{
            res.render('campgrounds/campgrounds',{campgrounds:foundCampgrounds});
        }
    });
});

router.post('/', middleware.isLoggedIn, upload.single('image'), async function(req,res){
    cloudinary.uploader.upload(req.file.path,async function(result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        // add author to campground
        req.body.campground.author = {
          id: req.user._id,
          username: req.user.username
        }
        try{
            let campground = await Campground.create(req.body.campground);
            let user = await User.findById(req.user._id).populate('followers').exec();
            let newNotification = {
                username: req.user.username,
                campgroundId: campground.id
            }
            for(const follower of user.followers){
                let notification = await Notification.create(newNotification);
                follower.notifications.push(notification);
                follower.save();
            }
            // redirect back to campgrounds page
            res.redirect(`/campgrounds/${ campground.id }`);
        } catch(err){
            req.flash('error',err.message);
            res.redirect('back');
        }
    });
});


router.get('/new', middleware.isLoggedIn,(req,res)=>{
    res.render('campgrounds/new');
});

router.get('/:id',(req,res)=>{
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err){
            console.log(err);
        } else{
            // console.log(foundCampground);
            res.render('campgrounds/show',{campground:foundCampground});
        }
    });
});

router.get('/:id/edit',middleware.checkCampgroundOwnership,(req,res)=>{
    Campground.findById(req.params.id,function(err,foundCampground){
        if(err){
            console.log(err);
        } else{
            res.render('campgrounds/edit',{campground:foundCampground});
        }
    });
});

router.put('/:id',middleware.checkCampgroundOwnership,(req,res)=>{
    Campground.findByIdAndUpdate(req.params.id,req.body.Campground,function(err,campground){
        if(err){
            console.log(err);
        } else{
            res.redirect('/campgrounds/'+req.params.id);
        }
    });
});

router.delete('/:id',middleware.checkCampgroundOwnership,(req,res)=>{
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err);
        } else{
            res.redirect('/campgrounds');
        }
    });
});

module.exports = router;
