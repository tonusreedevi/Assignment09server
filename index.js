const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion , ObjectId } = require("mongodb");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    console.log("MongoDB connected successfully");

    const db = client.db("ideavault");
    const ideaCollection = db.collection("ideas");
    const commentCollection = db.collection("comments")

     //comment post korar api 
      app.post("/comment", async (req, res) => {
      try {
        const commentData = req.body;
        const result = await commentCollection.insertOne(commentData);

        res.status(201).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Failed to create comment",
        });
      }
    });
     //card e post korar api


app.get("/comment/:ideaId", async (req, res) => {
  try {
    const { ideaId } = req.params;

    const comments = await commentCollection
      .find({ ideaId: ideaId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get comments",
    });
  }
});


// comment edit API
app.put("/comment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, userId } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    // Find the comment
    const existingComment = await commentCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Check ownership
    if (existingComment.userId !== userId) {
      return res.status(403).json({
        message: "You can only edit your own comment",
      });
    }

    // Update comment
    const result = await commentCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          comment: comment,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      message: "Comment updated successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update comment",
    });
  }
});


//comment delete korar api 
 

// comment delete API
app.delete("/comment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    // Find comment
    const existingComment = await commentCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Check ownership
    if (existingComment.userId !== userId) {
      return res.status(403).json({
        message: "You can only delete your own comment",
      });
    }

    // Delete
    const result = await commentCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({
      message: "Comment deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete comment",
    });
  }
});


    // POST idea add idear kaj ta ekhane hoi
    app.post("/idea", async (req, res) => {
      try {
        const ideaData = req.body;
        const result = await ideaCollection.insertOne(ideaData);

        res.status(201).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Failed to create idea",
        });
      }
    });

app.get("/idea", async (req, res) => {
  try {
    const result = await ideaCollection
      .find()
      .toArray();

    res.status(200).json(result);
  } catch (error) {
    console.error("Get all ideas error:", error);

    res.status(500).json({
      message: "Failed to get ideas",
    });
  }
});


//this is for my interection 
app.get("/comment/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const comments = await commentCollection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(comments);
  } catch (error) {
    console.error("Get user comments error:", error);

    res.status(500).json({
      message: "Failed to get user comments",
    });
  }
})

//my idea code 
app.get("/idea/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const ideas = await ideaCollection
      .find({ userId: userId })
      .sort({ _id: -1 })
      .toArray();

    res.status(200).json(ideas);
  } catch (error) {
    console.error("Get user's ideas error:", error);

    res.status(500).json({
      message: "Failed to get user's ideas",
    });
  }
});
//view details er api


    // app.get("idea/:id",async(req, res) =>{
    //     const {id}  = req.params
    //     const result =await ideaCollection.findOne({_id: new ObjectId(id)})
    //     res.json(result)
    // })
   
app.get("/idea/:id", async (req, res) => {
    const { id } = req.params;

    const result = await ideaCollection.findOne({
        _id: new ObjectId(id)
    });

    res.json(result);
});

    // Test route
    app.get("/", (req, res) => {
      res.send("IdeaVault Server is Running!");
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

run();