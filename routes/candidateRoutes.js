const express = require("express");
const router = express.Router();
const { jwtAuthMiddleware } = require("../authentication/jwt");
const Candidate = require("../models/candidateSchema.js");
const User = require("./../models/userSchema.js")

const checkAdminRole = async (userID) => {
  try {
      const user = await User.findById(userID);
      return user && user.role === 'admin';
  } catch (err) {
      console.error('Error checking admin role:', err);
      return false;
  }
};


router.post("/", jwtAuthMiddleware ,async (req, res) => {
  console.log(req.user);
  
  try {
    if(!(await checkAdminRole(req.user.id)))
      return res.status(403).json({message: 'user does not have admin role'});

  const data = req.body 

  // Create a new User document using the Mongoose model
  const newCandidate = new Candidate(data);

  // Save the new user to the database
  const response = await newCandidate.save();
  console.log('data saved');
  res.status(200).json({response: response});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
  try{
      if(! (await checkAdminRole(req.user.id)))
          return res.status(403).json({message: 'user does not have admin role'});
      
      const candidateID = req.params.candidateID; // Extract the id from the URL parameter
      const updatedCandidateData = req.body; // Updated data for the person

      const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
          new: true, // Return the updated document
          runValidators: true, // Run Mongoose validation
      })

      if (!response) {
          return res.status(404).json({ error: 'Candidate not found' });
      }

      console.log('candidate data updated');
      res.status(200).json(response);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
  }
})

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
  try{
      if(!checkAdminRole(req.user.id))
          return res.status(403).json({message: 'user does not have admin role'});
      
      const candidateID = req.params.candidateID; // Extract the id from the URL parameter

      const response = await Candidate.findByIdAndDelete(candidateID);

      if (!response) {
          return res.status(404).json({ error: 'Candidate not found' });
      }

      console.log('candidate deleted');
      res.status(200).json(response);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
  }
})

router.get('/vote/:candidateID', jwtAuthMiddleware , async (req , res) => {
  const candidateID = req.params.candidateID;
  const userId = req.user.id;

  try {
    
    const candidate = await Candidate.findById(candidateID);

    if(!candidate) {
      return res.status(404).json({message: "Candidate not found"})
    }

    const user = await User.findById(userId);

    if(!user) return res.status(404).json({message: "User not found"})

    if(user.role === 'admin') return res.status(404).json({message: "Admin can not vote"})

    if(user.isVoted) return res.status(404).json({message: "Vote already casted"})


    candidate.votes.push({user: userId});
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();

    return res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Internal Server Error'});
  }
})

router.get('/count', async (req, res) => {
  try{
      // Find all candidates and sort them by voteCount in descending order
      const candidate = await Candidate.find().sort({voteCount: 'desc'});

      // Map the candidates to only return their name and voteCount
      const voteRecord = candidate.map((data)=>{
          return {
              party: data.party,
              count: data.voteCount
          }
      });

      return res.status(200).json(voteRecord);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
  }
});

// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
  try {
      // Find all candidates and select only the name and party fields, excluding _id
      const candidates = await Candidate.find({}, 'name party -_id');

      // Return the list of candidates
      res.status(200).json(candidates);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
