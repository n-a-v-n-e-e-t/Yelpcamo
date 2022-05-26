const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');
// Comments Routes
router.get('/new',middleware.isLoggedIn,(req,res)=>{
    Campground.findById(req.params.id,function(err, foundCampground){
        if(err){
            console.log(err);
        } else{
            res.render('comments/new',{campground:foundCampground});
        }
    });
});

router.post('/',middleware.isLoggedIn,(req,res)=>{
    Campground.findById(req.params.id,function(err, campground){
        if(err){
            console.log(err);
            res.redirect('/campgrounds');
        } else{
            Comment.create(req.body.comment, function(err,comment){
                if(err){
                    console.log(err);
                } else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success","Sucessfully added comment");
                    res.redirect('/campgrounds/'+campground._id);
                }
            });
        }
    });
});

router.get('/:comment_id/edit',middleware.checkCommentOwnership,(req,res)=>{
    Comment.findById(req.params.comment_id,function(err,foundComment){
        if(err){
            res.redirect('back');
        } else{
            res.render('comments/edit',{comment:foundComment,campground_id:req.params.id});
        }
    });
});

router.put('/:comment_id',middleware.checkCommentOwnership,(req,res)=>{
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
        if(err){
            res.redirect('back');
        } else{
            res.redirect('/campgrounds/'+req.params.id);
        }
    });
});

router.delete('/:comment_id',middleware.checkCommentOwnership,(req,res)=>{
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect('back');
        } else{
            req.flash("success", "Successfully deleted comment");
            res.redirect('/campgrounds/'+req.params.id);
        }
    })
});

module.exports = router;