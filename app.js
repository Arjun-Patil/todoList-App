const express = require("express");
const bp = require("body-parser");
const Date = require(__dirname + "/Date.js")
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// let items = [];
// let works = [];
mongoose.connect("mongodb+srv://admin-Arjun:Arjun@43210@cluster0.shtoh.mongodb.net/todolist", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemSchema = new mongoose.Schema({
  item: String
})

const Items = new mongoose.model("Items", itemSchema);

const item1 = new Items({
  item: "Welcome to your todoList"
})

const item2 = new Items({
  item: "Hit the + button to add a new item"
})

const item3 = new Items({
  item: "<-- Hit this to delete a new item"
})

const defaultItems = [item1, item2, item3];

const defaultSchemaList = new mongoose.Schema({
  name: String,
  item: [itemSchema]
})

const Lists = new mongoose.model("lists", defaultSchemaList);


app.use(bp.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set("view engine", "ejs");

let day = Date();

app.get("/", function(req, res) {



  Items.find({}, function(err, storedResult) {
    if (storedResult.length === 0) {
      Items.insertMany(defaultItems, function(err) {
        if (err)
          console.log(err);
        else
          console.log("Default items inserted successfully");
      });
      res.redirect("/");
    } else
      res.render("list", {
        title: "Today",
        newItems: storedResult
      });
  });
});

app.get("/:customListName", function(req, res) {
  const defaultList = _.capitalize(req.params.customListName);

  Lists.findOne({
    name: defaultList
  }, function(err, found) {
    if (!err) {
      if (!found) {
        const list1 = new Lists({
          name: defaultList,
          item: defaultItems
        })
        list1.save();
        res.redirect("/" + defaultList);
      } else {
        res.render("list", {
          title: found.name,
          newItems: found.item
        });
      }
    }
  });


});

app.post("/", function(req, res) {
  const newItem = req.body.newItem;
  const newList = req.body.list;

  const item4 = new Items({
    item: newItem
  })

  if (newList === "Today") {
    item4.save();
    res.redirect("/");

  } else {
    Lists.findOne({name: newList}, function(err, foundList){
      foundList.item.push(item4);
      foundList.save();
      res.redirect("/" + newList);
    });

  }
});






app.post("/delete", function(req, res) {
  const del = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Items.findByIdAndRemove(del, function(err) {
      if (err)
        console.log(err);
      else {
        console.log("Item with item id " + del + " is deleted successfully");
      }
    });
    res.redirect("/")
  }else{
    Lists.findOneAndUpdate({name: listName},{$pull: {item: {_id: del}}}, function(err,foundlist){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }






});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully")
});
