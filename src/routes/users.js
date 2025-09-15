const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const {hashPassword, comparePassword} = require('../utils/hash');
const {generateToken} = require('../utils/jwt');

router.post('/register', async (req,res)=>{
  try{
    const {name,email,password} = req.body;
    if(!name||!email||!password) return res.status(400).json({error:'name,email,password required'});
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({data:{name,email,passwordHash}});
    res.status(201).json({id:user.id,name:user.name,email:user.email});
  }catch(e){
    if(e.code==='P2002') return res.status(409).json({error:'Email already exists'});
    console.error(e);
    res.status(500).json({error:'server error'});
  }
});

router.post('/login', async (req,res)=>{
  try{
    const {email,password} = req.body;
    const user = await prisma.user.findUnique({where:{email}});
    if(!user) return res.status(401).json({error:'Invalid credentials'});
    const valid = await comparePassword(password,user.passwordHash);
    if(!valid) return res.status(401).json({error:'Invalid credentials'});
    const token = generateToken(user);
    res.json({token});
  }catch(e){
    console.error(e);
    res.status(500).json({error:'server error'});
  }
});

module.exports = router;