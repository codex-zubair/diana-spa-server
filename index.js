const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require("dotenv").config();

// middleware
app.use(express.json());
app.use(cors());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.9zcs4sa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// !JWT Special Function 
function verifyJWT (req, res, next)
{
    const authHeader = req.headers.authorization;

    if(!authHeader)
    {
       return res.status(401).send({message: 'unauthorized access'})
    }

    // Auth token getting by split  
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err)
        {
            return res.status(403).send({message: err.message})
        }
        req.decoded = decoded;
        next();
    })
}



// async ans await
const run = async () => {


    // save zone


    // data insertion

    try {

        // Hitting the collection creating both side
        const serviceDataBase = client.db('diana-spa').collection('services');
        // Database FOR Review Section.
        const serviceReview = client.db('diana-spa').collection('reviews2');




        app.post('/jwt',(req,res)=> {
            const user = req.body;
            // JWT authentication SIGN IN BY USER EMAIL  
            const token = jwt.sign(user,process.env.ACCESS_TOKEN, {expiresIn:'1d'})
            res.send({token});
           
        })




        // *GET METHOD
        // !Sending/getting 3 Data from the Server SIDE 
        app.get('/', async (req, res) => {
            const query = {};
            const count = await serviceDataBase.estimatedDocumentCount(query);
            
            const cursor = serviceDataBase.find(query);
            const services = await cursor.skip(parseInt(count) -3).toArray();
            // const services = await cursor.limit(3).toArray();

            res.send(services.reverse());


        })


        // !Sending/getting all Data from the Server SIDE 
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceDataBase.find(query);
            const services = await cursor.toArray();

            res.send(services);


        })

        // !Sending/getting Specific Data from the Server SIDE 
        app.get('/service-details/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };
            const cursor = serviceDataBase.find(query);
            const services = await cursor.toArray();

            res.send(services);


        })




        // ! Getting user Reviews data from the Server side
        app.get('/review/:id', async (req, res) => {

            const id = req.params.id;
            const query = { ServiceID: id };
            const cursor = serviceReview.find(query)
            const review = await cursor.toArray();

            res.send(review);


        })

        // *JWT Token Secured
        // ! Getting specific user all Review
        app.get('/my-review/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            // Getting value from next.
            const  decoded = req.decoded;

            

            // Checking email address
            if(decoded.email !== email)
            {
                res.status(403).send(({message: 'unauthorized Access!'}))
            }

            const query = { email: email }
            const cursor = serviceReview.find(query)
            const review = await cursor.toArray();
            res.send(review);
        })


        // !Getting One ID data
        app.get('/my-review/edit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cursor = serviceReview.find(query);
            const result = await cursor.toArray();
            res.send(result);

        })




        // *POST METHOD
        // ! USER STORING REVIEWS INTO DATABASE
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await serviceReview.insertOne(review);
            // Returning the result to user
            res.send(result);

        })
        
        
        
        // !Adding service review
        app.post('/add-service', async (req, res) => {
            const service = req.body;
            const result = await serviceDataBase.insertOne(service);
            // Returning the result to user
            res.send(result);

        })



        // *Delete METHOD
        // !DELETING SPECIFIC DELETE
        app.delete('/my-review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            result = await serviceReview.deleteOne(query);
            res.send(result)
        })




        // *Fetch METHOD
        // !EDITED ITEM.
        app.patch('/my-review/:id', async (req, res) => {
            const review = req.body;
            const id = req.params.id;
            const query = { _id: ObjectId(id) }


            const result = serviceReview.updateOne(query, { $set: { review: review.text } })

            res.send(result);



        })


    }





    finally {
        console.log('finally code END!')
    }



}




run().catch(err => console.log(err));





// Sending data into client side by getting request
app.get('/', (req, res) => {
    res.send('Hello From DIANA SPA');
})



app.listen(port, () => {
    console.log('listening port', port);
})