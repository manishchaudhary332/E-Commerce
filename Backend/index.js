
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require("path")
const cors = require('cors')
const cloudinary = require('cloudinary').v2;    
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET 
});
const dotenv = require('dotenv').config()



app.use(express.json())
app.use(cors())

// dataBase connection  
mongoose.connect(process.env.MONGODB_URL)

// APi Creation


app.get('/', (req, res) => {
    res.send('Hello World!')
})

// Image storage Engine
// const storage = multer.diskStorage({
//     destination:'./upload/images',
//     filename:(req,file,cb)=>{
//         return cb(`null,${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
//     }
// })
// const storage = multer.diskStorage({
//     destination: './upload/images',
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
//     }
// })

const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
  }
});


const upload = multer({ storage: storage })

// create upload Endpoint for Images
// app.use('/images',express.static('upload/images'))
app.post("/upload", upload.single("product"), async (req,res)=>{
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "ecommerce_products" // folder in cloudinary
    });
    res.json({
        success:1,
        image_url: result.secure_url  // This URL will be used in frontend
    });
  } catch(err){
    console.log(err);
    res.status(500).json({ success:0, message:"Image upload failed"});
  }
});

// Schema for Creating Products
const Product = mongoose.model("Product",{
    id:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    new_price:{
        type:Number,
        required:true
    },old_price:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    available:{
        type:Boolean,
        default:true
    },

})

// app.post('/addproduct',async(req,res)=>{
//     const products = await Product.find({});
//     let id;
//     if(products.length>0){
//         let last_product_array = products.slice(-1)
//         let last_product = last_product_array[0]
//         id = last_product.id + 1
//     }else{
//         id = 1
//     }
//     const product = new Product({
//         id:id,
//         name:req.body.name,
//         image:req.body.image,
//         category:req.body.category,
//         new_price:req.body.new_price,
//         old_price:req.body.old_price,
//     });
//     console.log(product);
    
//     await product.save()
//     console.log("saved");
//     res.json({
//         success:true,
//         name:req.body.name
//     })
// })



// Creating APi for Removing products
app.post('/addproduct', async (req,res)=>{
    const products = await Product.find({});
    let id;
    if(products.length>0){
        let last_product = products[products.length - 1];
        id = last_product.id + 1;
    } else {
        id = 1;
    }

    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image, // frontend me Cloudinary URL bhejna hoga
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });

    await product.save();
    res.json({ success:true, name:req.body.name });
});





app.post('/removeproduct',async(req,res)=>{
    const product = await Product.findOneAndDelete({ id:req.body.id });
        console.log("Removed");
        
        res.json({
            success:true,
            name:req.body.name,
        })
    
})

// Creating APi for getting All Products
app.get('/allproducts',async(req,res)=>{
    const products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products)
})

// Schema creating for User Model
const Users = mongoose.model('Users',{
    name:{
        type:String
    },email:{
        type:String,
        unique:true
    },
    password:{
        type:String
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    
})

// Creating Endpoint for Registring tha user
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({success: false, message: "User already exists"});
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i]= 0;
    }
    const user = new Users({
        username:req.body.name,
        email:req.body.email,
        password:req.body.password,
        cartData:cart
    });
    await user.save();

    const data = {
        user:{
            id:user._id
        }
    }
    const token = jwt.sign(data, process.env.JWT_SECRET);
    res.json({
        success: true,
        token,
        message: "User registered successfully"
    });
});


// creating Endpoint of Login user 
app.post('/login',async(req,res)=>{
    const { email, password } = req.body;
    let user = await Users.findOne({ email });
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user:{
                    id:user._id 
                }
            }
            const token = jwt.sign(data,process.env.JWT_SECRET);
            res.json({success:true,token})
        }else{
            res.json({success:false, errors:"wrong password"})
        }
    }else{
        res.json({success:false, errors:"Wrong Email id"})
    }

    const data = {
        user: {
            id: user._id
        }
    }
    const token = jwt.sign(data,process.env.JWT_SECRET);
    res.json({
        success: true,
        token,
        message: "User logged in successfully"
    });
});


// create Endpoint for newcollection data
app.get('/newcollections', async (req, res) => {
    const products = await Product.find({ });
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newcollection);
});

// creating Endpoint for popular in women collection
app.get('/popularinwomen',async (req,res)=>{
    let products = await Product.find({category:"women"})
    let popular_in_women = products.slice(0,4)
    console.log("popular in women fetched");
    res.send((popular_in_women))
    
})

// creating middleware to fetch user
const fetchUser = async (req,res,next)=>{
    const token  = req.header('auth-token')
    if(!token){
        res.status(401).send({errors:"Please authenticate using valid token"})
    }else{
        try {
            const data = jwt.verify(token,process.env.JWT_SECRET)
            req.user = data.user;
            next()
        } catch (error) {
            res.status(401).send({errors:"Please authenticate using valid token "})
        }
    }
}

// creating endpoint for adding products in cartdata
app.post('/addtocart',fetchUser, async(req,res)=>{
    console.log("added ",req.body.itemId);
        let userData = await Users.findOne({_id:req.user.id})
        userData.cartData[req.body.itemId] += 1;
        await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
        res.send("Added")
})

// creating endpoint to remove product from cartData
app.post('/removefromcart',fetchUser,async(req,res)=>{
    console.log("removed ",req.body.itemId);
    
        let userData = await Users.findOne({_id:req.user.id})
        if(userData.cartData[req.body.itemId]>0){
             
            userData.cartData[req.body.itemId] -= 1;
            await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
            res.send("Removed")
        }
})

// creating endpoint to get cartdata 
app.post('/getcart',fetchUser,async(req,res)=>{
    console.log("Get Cart");
    let userData  = await Users.findOne({_id:req.user.id})
    res.json(userData.cartData)
    
})

app.listen(process.env.PORT, (error) => {
    if(!error){
         console.log(`Server is running on port ${process.env.PORT}`)
    }else{
        console.log(`Error : ${error}`)
    }
})





