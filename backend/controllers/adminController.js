import User from '../models/User.js';

// @desc    Admin: Get all users (Customers & Organizers)
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    //The syntax has been simplified. Only the password is removed and all other data (including verificationDoc) is retrieved as normal.
    const users = await User.find({}).select('-password'); 
    res.status(200).json(users);
  } catch (error) {
    console.error("Backend Error in getAllUsers:", error); // [LOG] - Log the error for debugging purposes
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// @desc    Admin: Approve an organizer account
// @route   PUT /api/admin/approve-organizer/:id
export const approveOrganizer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user && user.role === 'organizer') {
      user.isApproved = true;
      await user.save();
      res.status(200).json({ message: 'Organizer approved successfully' });
    } else {
      res.status(404).json({ message: 'Organizer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error approving organizer' });
  }
};

// @desc    Admin: Delete a user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (user) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};