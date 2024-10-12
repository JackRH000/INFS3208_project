const express = require('express')
const cors = require("cors");
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')

const app = express()

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  })); 


app.post('/encrypt', async (req, res) => {
    const phrase = req.body.phrase

    const hash = await bcrypt.hash(phrase,10)
    console.log(phrase)
    console.log(hash)
    res.send({'hash': hash})
})

app.post('/compare', async (req, response) => {
    const phrase = req.body.phrase
    const hash = req.body.hash

    await bcrypt.compare(phrase, hash, function (err, res) {
        if (err) {
            response.send({
                "success": false,
                "msg": "Could not connect to encryption server. Please try again later"
            }) 
            return
        }
        if (res) {
            response.send({
                "success": true,
                "msg": "Logged in successfully"
            })
            return
        } else {
            response.send({
                "success": false,
                "msg": "Incorrect password. Please try again later"
            })
        }
    })
}) 



app.listen(3002)  