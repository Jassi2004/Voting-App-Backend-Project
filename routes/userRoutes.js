const express = require("express");
const router = express.Router();
const User = require("./../models/userSchema");
const { generateToken , jwtAuthMiddleware } = require("./../authentication/jwt");

// To create a new user (Sign Up)
router.post("/signup", async (req, res) => {
  try {
    const userData = req.body;
    const newUser = new User(userData);
    const response = await newUser.save();

    const payload = {
      id: response._id,
    };
    const token = generateToken(payload);

    res.status(200).json({ response: response, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To login to the system (Log In)
router.post("/login", async (req, res) => {
  try {
    // Extract aadharCardNumber and password from request body
    const { aadharCardNumber, password } = req.body;

    // Check if aadharCardNumber or password is missing
    if (!aadharCardNumber || !password) {
      return res.status(400).json({ error: "Aadhar Card Number and password are required" });
    }

    // Find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid Aadhar Card Number or Password" });
    }

    // generate Token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);

    // resturn token as response
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.send(500).json({ error: "Internal Server Error" });
  }
});

// To update password (Chamge Password)
router.put('/profile/password', jwtAuthMiddleware , async (req, res)=>{
    try {
        const userUd = req.user;
        const {currentPassword , newPassword} = req.body;
    
        const user = await User.findById(userId);
    
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: "Invalid Username or Password"})
        }
    
        user.password = newPassword;
        await user.save();
    
        console.log("Password updated succesfully");
        res.status(200).json({message : "Password Updated"})
        
    } catch (error) {
        console.log(error);
        res.send(500).json({ error: "Internal Server Error" });
    }
})

router.get('/' , async (req, res) => {
  try {
    const data = await User.find();
    console.log("data fetched");
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})


module.exports = router;
