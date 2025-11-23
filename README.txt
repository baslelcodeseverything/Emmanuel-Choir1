Emmanuel Church Choir - Full project (Postgres, auto-init, admin)

How to deploy (Vercel or Render with Postgres/Neon):
1) Create a Postgres DB (Neon or Render Postgres). Copy the connection string (DB_URL).
2) Set environment variables: JWT_SECRET and DB_URL in your hosting provider.
3) Deploy the project (Node). The server auto-creates tables on startup—no shell needed.
4) Visit the site, register a user. To make someone admin: directly set role='admin' in the DB or use the admin panel after manually setting first admin via DB (or I can provide SQL to make the first user admin).

Note: For the first admin user you may need to run an SQL update in your DB:
UPDATE users SET role='admin' WHERE id=1;
