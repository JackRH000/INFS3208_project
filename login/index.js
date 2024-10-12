const express = require('express')
const cors = require("cors");
const mysql = require("mysql2")
const bodyParser = require('body-parser')


const app = express()

const ENCRYPT_URL = 'http://localhost:3002'

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  })); 

const connection = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'fixit_db' // Use the name of the database you created
});  


app.post('/login', (req, res) => {

    connection.connect((err) => {
        if (err) {
            console.log(err)
            res.send({
                status: 'ERROR',
                msg: 'Error connecting to the database: ' + err.stack,
                id: null
            })
            return;
        }
        const getLogin = async () => {
            let SQL = `SELECT idusers, email, password FROM users WHERE email = '${req.body.email}'`
            connection.query(SQL, async function(err,results) {
                
                if (err) {
                    res.send({
                        success: false,
                        msg: "Could not connect to database. Please try again later",
                        id: null
                    })
                } else {
                    if (results.length == 0) {
                        res.send({
                            success: false,
                            msg: "Incorrect email. Please try again",
                            id: null
                        })
                        return
                    }
                    const hash = results[0]['password']
                    console.log(req.body)
                    console.log(req.body.password)
                    
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            'phrase': req.body.password,
                            'hash': hash
                        })
                    };

                    const response = await fetch(ENCRYPT_URL + '/compare', requestOptions)
                    let status = await response.json()
                    status['id'] = results[0]['idusers']
                    
                    res.send(status)
                }
            })
        }

        getLogin()    
    });
})

app.post('/register', (req, res) => {

    connection.connect((err) => {
        if (err) {
            res.send({
                status: 'ERROR',
                msg: 'Error connecting to the database: ' + err.stack
            })
            return;
      }
        const insert = async () => {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    'phrase': req.body.password
                })
            };
            const response = await fetch(ENCRYPT_URL + '/encrypt', requestOptions)
            const hashedPassword = await response.json()
            let SQL = `INSERT INTO users (firstname, lastname, email, password) VALUES ('${req.body.firstname}', '${req.body.lastname}','${req.body.email}','${hashedPassword}')`
            connection.query(SQL, function(err,result) {
                if (err) {
                    res.send({
                        status: 'ERROR',
                        msg: err
                    })
                } else {
                    res.send({
                        status: "SUCCESS",
                        msg: "inserted into db"
                    })
                }
            })
        }

        insert()    
    });
})

app.listen(3003)  