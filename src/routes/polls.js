const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const {verifyToken} = require('../utils/jwt');

function auth(req,res,next){
  const header = req.headers.authorization;
  if(!header) return res.status(401).json({error:'Missing token'});
  const token = header.split(' ')[1];
  try{
    req.user = verifyToken(token);
    next();
  }catch(e){
    return res.status(401).json({error:'Invalid token'});
  }
}

router.post('/',auth, async (req,res)=>{
  try{
    const {question,options,isPublished} = req.body;
    if(!question||!Array.isArray(options)||options.length<2) return res.status(400).json({error:'question and at least 2 options required'});
    const poll = await prisma.poll.create({
      data:{
        question,
        isPublished:!!isPublished,
        creatorId:req.user.id,
        options:{create:options.map(t=>({text:t}))}
      },
      include:{options:true}
    });
    res.status(201).json(poll);
  }catch(e){console.error(e);res.status(500).json({error:'server error'});}
});

router.get('/', async (req,res)=>{
  try{
    const polls = await prisma.poll.findMany({include:{options:{include:{votes:true}}}});
    res.json(polls);
  }catch(e){console.error(e);res.status(500).json({error:'server error'});}
});

// GET /polls/:id - get one poll with options & vote counts
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: { include: { votes: true } },
        creator: { select: { id: true, name: true } }
      }
    });
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    // shape response with vote counts
    const resp = {
      id: poll.id,
      question: poll.question,
      isPublished: poll.isPublished,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      creator: poll.creator,
      options: poll.options.map(o => ({
        id: o.id,
        text: o.text,
        voteCount: o.votes.length
      }))
    };

    res.json(resp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;