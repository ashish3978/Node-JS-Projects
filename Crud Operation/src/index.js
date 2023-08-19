const express = require("express");
const app = express();
const mongo = require("mongodb");
const body = require("body-parser");
const path = require("path");

const multer = require("multer");
const fs = require("fs");

let imagefile = '';
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
      return callback(null,'./uploads/')
    },
    filename: function(req, file, callback) {
      imagefile = Date.now()+file.originalname
      return callback(null,imagefile);
    }
  });
  const upload = multer({storage: storage});
  const mainpath = path.join(__dirname, "../public");
  app.use(express.static(mainpath));
  app.use(express.static('uploads'));
  
  const imageMainPath = path.join(__dirname,"uploads")
app.set("view engine", "ejs");

const bodyparse = body.urlencoded({ extended: false });

const mongoclient = mongo.MongoClient;
const url = "mongodb://127.0.0.1:27017";
const client = new mongoclient(url);

async function myData() {
  try {
    await client.connect();
    console.log("Connection Successful");
    const db = client.db("database1");
    const collection = db.collection("db1");
    const result = await collection.find({}).toArray();

    let pdata = "";
    console.log(result);


    // insert
    app.get("/", (req, res) => {
      res.render("index", {
        data: result,
        pdata: pdata,
      });
      });

    app.post("/savedata", upload.single('image'), async (req, res) => {
      console.log("Saved DataBase");
      let id = req.body.id;
      console.log(imagefile);

      if (id != "") {
        pdata = "";
        pdata = userdata.find((i) => {
          return i.id == id;
      })
      oldImageName = (pdata.image!='')?pdata.image:'';
      
      if(req.file && imagefile != ''){
          let imgname = "uploads/"+pdata.image
          fs.unlink(imgname,()=>{
              console.log("Image deleted...")
          })
      }     
            let info =await collection.updateOne( {
              id: id 
            },{ 
                $set:{
                  name: req.body.name,
                  age: req.body.age,
                  image: (req.file && imagefile != '')?imagefile:oldImageName 
                } 
            });
            console.log(info)   
      } else {
        data = {
          id: (result.length + 1).toString(),
          name: req.body.name,
          age: req.body.age,
          image: imagefile
        };
        console.log(data);
        result.push(data);

        let info = await collection.insertOne(data);
        console.log(info);
      }
      res.redirect("/");

      pdata = '';
      res.render('index', {
          data:result,
          pdata:pdata
      });
    });

    app.get("/delete/:id", async (req, res) => {
      let id = req.params.id;
      pdata = result.find((i)=>{
        return i.id == id
      })
    let imgname = "uploads/"+pdata.image
    fs.unlink(imgname,()=>{
        console.log("Image deleted...")
    })

      let del = await collection.deleteOne({ id : id })
      r1 = await collection.find({}).toArray();
      pdata = '';
      res.render("index", {
        data: r1,
        pdata: pdata,
      });
        console.log(del);
    });

    app.get('/edit/:id',async (req, res) => {

        userdata = await collection.find({}).toArray();
        let id = req.params.id
        pdata = result.find((i)=>{
            return i.id == id
        })
        console.log(pdata);
        res.render('index', {
          data: result,
          pdata:pdata
        });
    });
  } catch (err) {
    console.log(err);
  }
}
myData();

app.listen(8000, "127.0.0.1", () => {
  console.log("Server running on port 8000");
});
