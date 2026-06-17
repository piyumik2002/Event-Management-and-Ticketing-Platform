import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// A simple function that creates a token for a user based on their ID. The token is signed with a secret key and has an expiration time of 30 days.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // 30 days valid
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  // Also getting 'organizationName' from the frontend when the user is registering as an organizer.
  console.log("🔥 Request reached controller!");
  const { name, email, password, role, organizationName } = req.body;

  try {
    // Check if the user has previously registered.
    console.log("BODY DATA:", req.body);
    console.log("FILE DATA:", req.file);
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }


    //If a file was sent from the Frontend via Multer Middleware, its path will be taken.
    const verificationDoc = req.file ? req.file.path : ''; 

    //If you are an organizer, the account is not approved first (false).
    // If you are a customer, the account is created directly for you.
    const isApproved = role === 'organizer' ? false : true;

    // create new user in the database with the provided information and the generated token
    const user = await User.create({
      name,
      email,
      password,
      role, // If not entered, the default will be 'customer'.
      organizationName: role === 'organizer' ? organizationName : '', // Only the organizer will enter the organization name.
      verificationDoc, //The path of the NIC/BR file goes to the db.
      isApproved,      //The approved status will go away.
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved, //I'm also sending this to the frontend to let them know.
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error("DEBUG ERROR:", error); 
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Searching for the user from the db (along with the password)
    const user = await User.findOne({ email }).select('+password');

    // If the user exists and the password is correct
    if (user && (await user.matchPassword(password))) {
      
      // If you are an Organizer and have not yet been approved by the Admin, you will not be allowed to log in!
      if (user.role === 'organizer' && !user.isApproved) {
        return res.status(403).json({ 
          message: 'Your account is pending verification. Please wait for Admin approval.' 
        });
      }

      //The 'role' and 'organizationName' required for the redirect to succeed are also sent on the frontend.
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, //This is essential reading for the frontend!
        organizationName: user.organizationName, //This is also being sent to show on the dashboard.
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

