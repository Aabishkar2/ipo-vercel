module.exports = (req, res) => {
  const name = req.query.name || "world";
  res.status(200).send(`Hello, ${name}!`);
};
