const isAdmin = (req, res, next) => {
  if (req.userRole !== "ADMIN") {
      return res.status(403).json({ error: ` Acesso negado. Apenas administradores podem realizar essa ação.` });
    }
    next();
  };
  
  export default isAdmin