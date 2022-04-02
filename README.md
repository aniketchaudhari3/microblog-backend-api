# Microblog API
Backend API for a simple microbloging website

## Libraries used

 - express  - Web framework
 - mongoose - ORM
 - jsonwebtoken - To create JWT tokens
 - bcrypt - To generate password hashes
 - helmet - Security middleware
 - compression - Compression middleware
 - express-rate-limit - To rate limit requests

## Steps to run (on local)
1. Add environment variables to `.env.dev`
2. Install dependencies - `npm install`
3. Run dev server - `npm run dev`
 
## Docs
URL - http://microblogapi-docs.surge.sh/

### Environment variables required
- PORT
- SECRET
- MONGODB_URI

These variables are to be placed in -
- .env.dev - For development environment
- .env.prod - For production environment
