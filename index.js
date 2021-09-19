const express = require('express');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(fileupload());
app.use(express.static('doctors'));
const port = 500;
app.get('/',(req,res)=>{
    res.send("hello db is working now");
})


const uri = "mongodb+srv://golamMostafa:undefined42@cluster0.bntby.mongodb.net/patientsInfo?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("patientsInfo").collection("details");
  const doctor = client.db("patientsInfo").collection("doctorInfo");
  console.log("inside mongobd")

  app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    collection.insertOne(appointment)
        .then(result => {
            res.send(true);
        })
        .catch(err => {
           res.send(err);
        })
});

app.get('/allPatients', (req, res) => {
    collection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })

});

app.post('/addDoctors', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const filePath = `${__dirname}/doctors/${file.name}`;

    file.mv(filePath, err => {
        if (err) {
            return res.status(500).send(err);
        }
        const newImg = fs.readFileSync(filePath);
        const enImg = newImg.toString('base64');
        var image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer(enImg, 'base64')
        }
        doctor.insertOne({ Name: name, Email: email, Img: image })
            .then(result => {res.send("upload a file")})
    }
    );
});


app.get('/doctorsFound', (req, res) => {
    doctor.find({})
        .toArray((err, info) => {
            res.send(info);
        })
})

app.post('/isDoctor', (req, res) => {
    const email = req.body.Email;
    doctor.find({ Email: email })
        .toArray((err, documents) => {
            res.send(documents);
        })
})

app.post('/appointmentsByDate', (req, res) => {
    const date = req.body;
    const email = req.body.email;
    doctor.find({ Email: email })
        .toArray((err, documets) => {
            if (documets.length === 0) {
                collection.find({ Email: email })
                    .toArray((err, info) => {
                        res.send(info)
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

})
});

app.listen(process.env.PORT || port);

