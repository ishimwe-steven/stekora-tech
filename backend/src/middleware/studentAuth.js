const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // payload should at least contain: id, full_name, email, course_id
    req.student = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token invalid' });
  }
};

