import { RequestHandler } from 'express';
import User from '../model/User';

export const checkUserActiveStatus: RequestHandler = async (req: any, res, next) => {
  try {
      const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    

    const user = await User.findById(userId);
      

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.status === 'inactive') {
      res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
      return;
    }

    // Optionally pass the full user document to the request
    req.userDoc = user;

    next(); // Proceed to next middleware
  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
