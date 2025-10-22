const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User"); // yaha apna User model ka path sahi lagao

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/yourDBName", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createOwner() {
  try {
    const hashedPassword = await bcrypt.hash("OwnerPassword123", 10); // apna desired password yaha dalna

    const owner = new User({
      username: "owner01",
      password: hashedPassword,
      role: "owner",
      balance: 1000000,
      player_balance: 97714.29,
      credl: 1000000,
      pr_client: 90,
      worli_com_pr: 10,
      p_l: 0,
      exposure: 0,
      domain: "shoutpe247.com",
      uplineId: null,
      exposureLimit: -1,
      timezone: "Asia/Kolkata"
    });

    await owner.save();
    console.log("✅ Owner created:", owner);
  } catch (err) {
    console.error("❌ Failed to create owner:", err);
  } finally {
    mongoose.connection.close();
  }
}

createOwner();
