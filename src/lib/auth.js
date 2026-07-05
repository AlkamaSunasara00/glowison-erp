import jwt from 'jsonwebtoken';

export const withAuth = (handler) => {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized. No token provided.' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
    }
  };
};
