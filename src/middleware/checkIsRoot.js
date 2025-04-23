function checkIsRoot(req, res, next) {
    if (req.user?.role !== 'root') {
      return res.status(403).json({ message: 'Acceso denegado: solo root' });
    }
  
    next();
  }
  
  module.exports = checkIsRoot;
  