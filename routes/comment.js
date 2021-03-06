var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// comments new
router.get("/new", middleware.isLoggedIn, function(req, res) {
 Campground.findById(req.params.id, function(err, campground){
  if(err || !campground){
      req.flash("error", "request not found!");
      res.redirect("back");
   console.log(err);
  } else {
   res.render("comments/new", {campground: campground});
  }
 });
});
// comment create
router.post("/", middleware.isLoggedIn, function(req, res){
 // lookup campground using id
 Campground.findById(req.params.id, function(err, campground) {
     if(err){
        console.log(err);
         res.redirect("/campgrounds");
     } else {
       // create new comment
      Comment.create(req.body.comment, function(err, comment){
       if(err){
        req.flash("error", "something went wrong!");
        console.log(err);
       } else {
        // add username and id to comment
        comment.author.id = req.user._id;
        comment.author.username = req.user.username;
        // save comment
         comment.save();
         // connect new campgound to comment
         campground.comments.push(comment._id);
         campground.save();
         console.log(comment);
         req.flash("success", "Congratulations! Succesfully added comment!");
          // redirect campground show page
          res.redirect("/campgrounds/" + campground._id);
       }
      });
     }
 });
});
// COMMENT: EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err || !foundCampground){
            req.flash("error", "sorry, that campgound does not exist!");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err || !foundComment){
                req.flash("error", "Comment not found!");
                res.redirect("back");
            } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});
// COMMENT: UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
 Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment){
  if(err){
   res.redirect("back");
  } else {
   res.redirect("/campgrounds/" + req.params.id);
  }
 });
});
// COMMENT: DELETE ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err, comment){
    if(err){
     res.redirect("back");
    } else {
     req.flash("error", "Comment deleted!");
     res.redirect("/campgrounds/" + req.params.id);
    }
   });
});
// middle ware

module.exports = router;