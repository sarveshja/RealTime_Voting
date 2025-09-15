# Voting App with JWT

## Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js   # optional
npm run dev
```

Use POST /users/register to register and POST /users/login to get a JWT token.
Then use Authorization: Bearer <token> on /polls endpoints.
