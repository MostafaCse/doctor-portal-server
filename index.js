const express = require('express');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(fileupload());
app.use(express.static('doctors'));


const uri = "mongodb+srv://GolamMostafa:iiuccse42@cluster0.f4pfg.mongodb.net/doctorPortal?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("doctorPortal").collection("appointment");
    const doctor = client.db("doctorPortal").collection("doctors");
    console.log("inside mongodb");
    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        collection.insertOne(appointment)
            .then(result => {
                res.send(true);
            })
            .catch(err => {
                console.log(err);
            })
    });
    app.get('/allPatients', (req, res) => {
        collection.find({})
            .toArray((err, documents) => {
                res.send(documents);
                console.log(documents)
            })

    });
    app.post('/addDoctors', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        console.log(name, email, file);
        const filePath = `${__dirname}/doctors/${file.name}`;

        file.mv(filePath, err => {
            if (err) {
                return res.status(500).send(err);
                console.log(err);
            }
            const newImg = fs.readFileSync(filePath);
            const enImg = newImg.toString('base64');
            var image = {
                contentType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer(enImg, 'base64')
            }
            console.log(name, email, image);
            doctor.insertOne({ Name: name, Email: email, Img: image })
                .then(result => {
                    //  fs.remove(filePath, error => {
                    //      if (error) {
                    ////        console.log(error);

                    //    }
                    res.send("upload a file");
                    console.log("upload a file")
                    //   })

                })
            // res.send('File uploaded!');
        }

        );
    });

    app.get('/doctorsFound', (req, res) => {
        doctor.find({})
            .toArray((err, info) => {
                res.send(info);
                  console.log(info);
            })
    })

    app.post('/isDoctor', (req, res) => {
        const email = req.body.Email;
        doctor.find({ Email: email })
            .toArray((err, documents) => {
                res.send(documents);
                console.log(email, documents);
            })
    })
    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        console.log(email);

        doctor.find({ Email: email })
            .toArray((err, documets) => {
                if (documets.length === 0) {
                    collection.find({ Email: email })
                        .toArray((err, info) => {
                            res.send(info)
                            console.log(info)
                        })
                }
                else {
                    collection.find({ date: date.date })
                        .toArray((err, info) => {
                            res.send(info)
                            console.log(info)
                        })
                }
            })
        /* .toArray((err, doctor) => {
             const fillter = { date: date.date }
             console.log(fillter);
             if (doctor.length === 0) {
                 fillter.email = email;
                 console.log(fillter);
             }
             collection.find(fillter)
                 .toArray((err, documents) => {
                     console.log(fillter);
                     res.send(documents)
                 })
         })*/
    })
    //  client.close();
}
)

app.listen(5000, () => {
    console.log("database is conncet");
})

