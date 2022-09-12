const express = require("express")
const app = express()
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')

const bodyParser = require('body-parser');
const { request } = require("express");
app.use(cookieParser())

app.use(express.json())

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'Abhi@123',
        database: 'NG'
    }
});


// This Below code will make the table, if it(table) doesn't exists
knex.schema.hasTable('userData').then(function (exists) {
    if (!exists) {
        return knex.schema.createTable('userData', function (table) {
            table.increments('id').primary();
            table.string('name', 100);
            table.string('mailId', 50).unique();
            table.string('password', 100);
        });
    }
}).then(() => {
    console.log('Table Created Successfully.');
}).catch((err) => {
    console.log(err, "Some Error Came.");
})

app.post('/signup', (req, res) => {
    const bodyData = req.body;
    console.log(bodyData, "HIiiiii i am body data");
    knex('userData').insert(bodyData).then((Data) => {
        bodyData['id'] = Data[0]
        res.send({ 'status': 'success', 'data': bodyData })
    }).catch((err) => {
        console.log(err, "Errrrrrrrrrr");
        res.send({ 'status': "error", 'message': err.sqlMessage })
    })
})

app.post("/login", (req, res) => {
    knex('userData')
        .where({ mailId: req.body.email })
        .then((datauser) => {
            // console.log(datauser);
            // console.log(datauser[0].password, "Hi datauser password");
            // console.log(req.body.password, "Hi reqbodypassword");
            if (datauser.length == 0) {
                res.send("Invalid User")
            }
            else if (datauser[0].password == req.body.password) {
                const token = jwt.sign({ id: datauser[0].id, name: datauser[0].name, mailId: datauser[0].mailId }, "Secret Key");
                // res.send({"Your Token is": token, Status : "Success"});
                res.cookie('Token', token, { maxAge: 360000 }).send('Your cookie is set');
            }
            else {
                res.send("Password is wrong")
            }
        }).catch((err) => {
            res.send(err, "Mail and Password is invalid.")
        })
})


app.get("/me", (req, res) => {
    var reqtoken = req.cookies.Token
    if (reqtoken == undefined) {
        res.status(404).send({"Status" : "error", "Message": "No Token Provided"})
    }
    console.log(reqtoken);
    res.send(jwt.verify(reqtoken, "Secret Key"))
})


app.get("/getdata", (req, res) => {
    knex('userData').then((data) => {
        res.send(data)
    }).catch((err) => {
        console.log(err, "There might be no data.");
    })
})


app.listen(3000, () => {
    console.log(`Server is running at Port ${3000}`);
})