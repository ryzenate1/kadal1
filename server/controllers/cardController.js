const Card = require('../models/Card');

exports.getAll = async (req, res) => {
  const section = req.query.section;
  const cards = section ? await Card.find({ section }) : await Card.find();
  res.json(cards);
};

exports.getOne = async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) return res.status(404).json({ error: 'Not found' });
  res.json(card);
};

exports.create = async (req, res) => {
  const { title, description, imageUrl, section } = req.body;
  const card = await Card.create({ title, description, imageUrl, section });
  res.status(201).json(card);
};

exports.delete = async (req, res) => {
  const card = await Card.findByIdAndDelete(req.params.id);
  if (!card) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
}; 