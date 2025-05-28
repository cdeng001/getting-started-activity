import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { MongoClient, ServerApiVersion } from 'mongodb';
import { AuthResponse } from "./models/auth-response.interface.js";
dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;

const credentials = 'C:/certs/disc-rpg/X509-cert-4911050695641508064.pem'
const client = new MongoClient('mongodb+srv://disc-rpg-dev.jbup1ry.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=disc-rpg-dev', {
  tlsCertificateKeyFile: credentials,
  serverApi: ServerApiVersion.v1
});
async function run(id: string) {
  try {
    await client.connect();
    const database = client.db("disc-rpg-dev");
    const collection = database.collection("guilds");
    const doc = await collection.findOne({ guildId: id });
    console.log(doc);

    if (doc == null) {
      await collection.insertOne({ guildId: id })
    }
    // perform actions using client
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

// Allow express to parse JSON bodies
app.use(express.json());

app.post("/api/token", async (req, res) => {
  
  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams([
      ['client_id', process.env.VITE_DISCORD_CLIENT_ID],
      ['client_secret', process.env.DISCORD_CLIENT_SECRET],
      ['grant_type', "authorization_code"],
      ['code', req.body.code],
    ]),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json() as AuthResponse;

  // Return the access_token to our client as { access_token: "..."}
  res.send({access_token});
});

app.get("/api/guilds/:id", async (req, res) => {
  const id = req.params.id;
  await run(id);
  res.send({ok: true});
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
