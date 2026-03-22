# Neon Password Rotation

Because a real database connection string was exposed during setup, rotate the Neon password before using this project in production.

## Steps

1. Open your Neon project dashboard.
2. Click `Connect`.
3. Choose the correct branch, role, and database.
4. Click `Reset password`.
5. Copy the newly generated password or the refreshed connection string.
6. Update the value in:
   - local `.env.local`
   - Vercel `DATABASE_URL`
   - any other deployment target using the same database role
7. Re-run a quick check:

```bash
npm run db:generate
npm run db:seed
```

Reference:

- https://neon.com/docs/get-started-with-neon/connect-neon
- https://neon.com/blog/oops-proof-your-vibe-code-with-neon-because-mistakes-happen
