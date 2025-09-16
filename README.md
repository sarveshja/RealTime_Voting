# Voting App (Node.js + Express + Prisma + PostgreSQL + JWT + Socket.IO)

```This is a full-stack backend API for creating polls, voting, and receiving real-time vote updates.
It uses:
- Node.js / Express.js
- PostgreSQL via Prisma ORM
- JSON Web Tokens (JWT) for authentication
- Socket.IO for real-time vote updates

---

## 📦 Requirements

- Node.js 18+ and npm
- PostgreSQL (running locally on port 5432 or change `DATABASE_URL` in `.env`)

---

## ⚙️ Setup Instructions

1. **Clone the repository**

git clone <your-repo-url>
cd voting_app
Install dependencies
npm install
Set up your environment file

Copy .env.example to .env and adjust values (database URL, JWT secret):

DATABASE_URL="postgresql://postgres:123456@localhost:5432/voting?schema=public"
JWT_SECRET="supersecret"
PORT=4000
Apply Prisma migrations
npx prisma migrate dev --name init_schema
This will create the database tables.
You can also open Prisma Studio to inspect tables:
npx prisma studio
Run the server
npm run dev
Server will run at:
http://localhost:4000

📚 Endpoints
Register new user
POST /users/register
Body:
{
  "name": "Bob",
  "email": "bob@example.com",
  "password": "password123"
}

Login user
POST /users/login
Body:
{
  "email": "bob@example.com",
  "password": "password123"
}
Returns:
{ "token": "<JWT>" }

Create poll (requires JWT)
POST /polls
Headers: Authorization: Bearer <JWT>
Body:
{
  "question": "What is your favourite framework?",
  "options": ["React","Vue","Angular"],
  "isPublished": true
}

List polls (public)
GET /polls

Get one poll 
GET /polls/:id

Vote (requires JWT)
POST /votes
Headers: Authorization: Bearer <JWT>
Body:
{
  "pollId": 1,
  "optionId": 2
}
Response:

{
  "message": "Vote recorded",
  "voteId": 1,
  "results": [
    { "optionId": 2, "text": "Vue", "voteCount": 1 }
  ]
}
🔴 Real-Time Vote Updates with Socket.IO
Include the Socket.IO client in your frontend or browser console:

<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
<script>
  const socket = io('http://localhost:4000');

  // join a poll room to receive updates
  socket.emit('join_poll', { pollId: 1 });

  socket.on('vote_update', (data) => {
    console.log('Updated vote counts', data);
  });
</script>
Whenever someone votes on poll 1, all clients who joined that poll room will receive the vote_update event with updated counts.

📁 Project Structure

src/
  index.js           # main server file (Express + Socket.IO)
  routes/
    users.js         # register/login
    polls.js         # create/list polls
    votes.js         # vote and broadcast updates
prisma/
  schema.prisma      # database models and relationships
utils/
  jwt.js             # sign/verify JWT tokens
.env.example         # environment template
package.json
README.md           # this file
📝 Notes
node_modules, .env and prisma/migrations/ are gitignored, so clone and run npx prisma migrate dev to create the tables locally.

Use Postman or curl to test endpoints, or fetch from browser console.

Socket.IO client library is available via CDN.```
