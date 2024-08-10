const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const adminModel = require("./models/admin")
const missingModel = require("./models/missing")

let app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://Richi2001:R1CH1R0Y@cluster0.ulfkc.mongodb.net/WayanadRescueDb?retryWrites=true&w=majority&appName=Cluster0")

app.post("/Add",async(req,res)=>{
    let input=req.body
    let token=req.headers.token
    jwt.verify(token,"wayanadApp",async(error,decoded)=>{
        if(decoded){
            console.log(input)
            let result=new missingModel(input)
            await result.save()
            res.json({"status":"success"})
        }else{
            res.json({"status":"invalid authentication"})
        }
    })
})

app.post("/AdminSignUp", async (req, res) => {
    let input = req.body
    let hashedPassword = bcrypt.hashSync(input.password, 10)
    input.password = hashedPassword
    adminModel.find({ username: input.username }).then(
        (items) => {
            if (items.length > 0) {
                res.json({ "status": "Username already exists" })
            } else {
                console.log(input)
                let result = new adminModel(input)
                result.save()
                res.json({ "status": "success" })
            }
        }
    )
})

app.post("/AdminSignIn",async(req,res)=>{
    let input=req.body
    let result=adminModel.find({username:input.username}).then(
        (items)=>{
            if (items.length>0){
                const passwordValidator=bcrypt.compareSync(input.password,items[0].password)
                if (passwordValidator){
                    jwt.sign({username:input.username},"wayanadApp",{expiresIn:"1d"},(error,token)=>{
                        if(error){
                            res.json({"status":"error","error":error})
                        }else{
                            console.log(input)
                            res.json({"status":"success","token":token,"userId":items[0]._id})
                        }
                    })
                }else{
                    res.json({"status":"incorrect password"})
                }
            }else{
                res.json({"status":"invalid username"})
            }
        }
    ).catch()
})

app.listen(3300, () => {
    console.log("Server Started")
}
)
