HOW TO USE THESE API FILES (quick):

1) Commit these files into the root of your GitHub repo so you have:
   - api/register.js
   - api/login.js
   - api/chat.js
   - api/admin.js
   - data.json
   - package.json

2) Commit and push to GitHub, then deploy on Vercel (Vercel will run npm install automatically).

3) IMPORTANT: On Vercel set an Environment Variable ADMIN_KEY for admin actions (or use default 'admin123').

4) Endpoints:
   POST /api/register  -> { name, email, password }
   POST /api/login     -> { email, password } returns demo token
   GET  /api/chat      -> list messages
   POST /api/chat      -> { name, message }
   GET  /api/admin     -> list users (requires header x-admin-key)
   POST /api/admin     -> { userId, role } to update role (requires admin key)

Note: Serverless functions can read files but writes may be ephemeral on Vercel. For production use a proper DB.
