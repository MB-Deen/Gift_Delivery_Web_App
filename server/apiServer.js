const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://mtharick:gf1QYd5IFQa3wQtW@gift-deliveryapp.ctlcbxu.mongodb.net/?retryWrites=true&w=majority&appName=Gift-DeliveryApp"; // connection string to MongoDB Atlas
const client = new MongoClient(uri);

// Global for general use
var userCollection;
var orderCollection;

async function connectDB() {
  
	try {

	  await client.connect();
	  db = client.db("giftdelivery"); 
	  console.log("Connected to MongoDB Atlas\n");
	  userCollection = db.collection("users"); 
	  orderCollection = db.collection("orders");

    } catch (error) {
    
	  console.error("MongoDB connection error:", error + "\n");
    }
}

connectDB();


app.get('/', (req, res) => {
  	res.send('<h3>Welcome to Gift Delivery server app!</h3>')
})


app.get('/getUserDataTest', async (req, res) => {
	
	try {
		
		const docs = await userCollection.find({}).toArray();
		console.log(JSON.stringify(docs) + " have been retrieved\n");
		res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		console.log("[GET] /getUserDataTest - Retrieved users:\n", docs, "\n");

	} catch (err) {

		res.status(500).json({ message: "Server error", error: err });
	}
});
  

app.get('/getOrderDataTest', async (req, res) => {
	
	try {

		const docs = await orderCollection.find({}).toArray();
		console.log(JSON.stringify(docs) + " have been retrieved\n");
		res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		console.log("[GET] /getOrderDataTest - Retrieved orders:\n", docs, "\n");

	} catch (err) {

		res.status(500).json({ message: "Server error", error: err });
	}
});



app.post('/verifyUserCredential', async (req, res) => {

	console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 

	const loginData = req.body;

	try {  

		const doc = await userCollection.findOne({email:loginData.email, password:loginData.password}, {projection:{_id:0}});
		console.log( JSON.stringify(doc) + " have been retrieved\n");
		res.status(200).send(doc); 
		console.log("[POST] /verifyUserCredential - Payload:\n", loginData);
		if (doc) {
			console.log("Login success - User found:\n", doc, "\n");
		} else {
			console.log("Login failed - Invalid credentials\n");
		}
	} catch (err) {
  
		res.status(500).json({ message: "Server error", error: err });
	}
});

// Check if email already exists
app.get("/checkUserEmail", async (req, res) => {
	try {
	  const email = req.query.email;
	  const user = await db.collection("users").findOne({ email: email });
	  res.send({ exists: !!user }); // true if user found, false otherwise
	  console.log(`[GET] /checkUserEmail - Checking for email: ${email} -> Exists: ${!!user}`);

	} catch (err) {
	  console.error("Error in /checkUserEmail:", err);
	  res.status(500).send({ error: "Server error" });
	}
  });
  
  // Register user
  app.post("/registerUser", async (req, res) => {
	try {
		const result = await db.collection("users").insertOne(req.body);
		res.status(200).send({ success: true, result: result });
		console.log("[POST] /registerUser - Loaded:\n", req.body);
		console.log("User registration successful. Inserted ID:", result.insertedId, "\n");
	} catch (e) {
		res.status(500).send({ success: false, error: e.message });
	  	res.send({ success: false, error: e });
		console.error("Error in /registerUser:", e.message);
	}
  });


app.post('/insertOrderData', async (req, res) => {
    
    console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 

	const orderData = req.body; 	

	try {

		const result = await orderCollection.insertOne(orderData);
		console.log("Order record with ID "+ result.insertedId + " have been inserted\n");
		res.status(200).send(result);
		console.log("Order inserted:\n", result, "\n");

	} catch (err) {
		
		res.status(500).json({ message: "Server error", error: err });
	}
    
});

app.get("/getUserOrders", async (req, res) => {
	try {

		const email = req.query.customerEmail;
		if (!email) return res.status(400).send({ error: "Email is required" });
		const userOrders = await orderCollection.find({ customerEmail: email }).toArray();
		res.status(200).send(userOrders);
		console.log(`[GET] /getUserOrders - Fetching orders for: ${email}`);
		console.log("Orders retrieved:\n", userOrders, "\n");

	} catch (err) {
		console.error("Error in /getUserOrders:", err);
		res.status(500).send({ error: "Server error" });
	}
});

app.delete("/deleteUserOrders", async (req, res) => {
	try {
		console.log('Trying to delete user orders...');
		const email = req.query.email;
		if (!email) return res.status(400).send({ error: "Email is required" });
		const result = await orderCollection.deleteMany({ customerEmail: email });
		console.log(result.deletedCount + " orders have been deleted\n");
		res.status(200).send({ deletedCount: result.deletedCount });
		console.log(`[DELETE] /deleteUserOrders - Deleting orders for: ${email}`);
		console.log("Orders deleted:\n", result, "\n");
		if (result.deletedCount > 0) {
			console.log("Orders deleted successfully\n");
		} else {
			console.log("No orders found for the specified email\n");
		}
		
console.log(`${result.deletedCount} orders deleted\n`);
	} catch (err) {
		console.error("Error in /deleteUserOrders:", err);
		res.status(500).send({ error: "Server error" });
	}
});
  
app.listen(port, () => {

  	console.log(`Gift Delivery server app listening at http://localhost:${port}`) 
});
