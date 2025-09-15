// src/routes/votes.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken } = require('../utils/jwt');

// simple JWT auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing token' });

  const token = header.split(' ')[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * POST /votes
 * Body: { pollId: number, optionId: number }
 * Requires Authorization: Bearer <token>
 */
router.post('/', auth, async (req, res) => {
  try {
    const { pollId, optionId } = req.body;
    if (!pollId || !optionId) {
      return res.status(400).json({ error: 'pollId and optionId required' });
    }

    // check that option belongs to poll
    const option = await prisma.pollOption.findUnique({
      where: { id: optionId }
    });
    if (!option || option.pollId !== pollId) {
      return res.status(400).json({ error: 'optionId not part of poll' });
    }

    // check if user already voted in this poll
    const existing = await prisma.vote.findUnique({
      where: {
        userId_pollId: {
          userId: req.user.id,
          pollId
        }
      }
    }).catch(() => null);

    if (existing) {
      return res.status(409).json({ error: 'User already voted in this poll' });
    }

    // create vote
    const vote = await prisma.vote.create({
      data: {
        user: { connect: { id: req.user.id } },
        poll: { connect: { id: pollId } },
        pollOption: { connect: { id: optionId } }
      }
    });

    // compute updated counts
    const counts = await prisma.pollOption.findMany({
      where: { pollId },
      include: { votes: true }
    });
    const results = counts.map(c => ({
      optionId: c.id,
      text: c.text,
      voteCount: c.votes.length
    }));

    // broadcast updated counts to all sockets in this poll room
    const io = req.app.get('io');
    if (io) {
      io.to(`poll_${pollId}`).emit('vote_update', { pollId, results });
    }

    res.status(201).json({ message: 'Vote recorded', voteId: vote.id, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
