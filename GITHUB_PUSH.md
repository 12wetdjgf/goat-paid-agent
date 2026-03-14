# Push To GitHub

## 1. Initialize git

```bash
cd C:\Users\14936\goat-paid-agent
git init
git add .
git commit -m "Initial hackathon submission"
```

## 2. Create a GitHub repo

Create a new empty repository on GitHub, for example:

- `goat-paid-agent`

## 3. Add remote

```bash
git remote add origin https://github.com/<your-username>/goat-paid-agent.git
```

## 4. Push

```bash
git branch -M main
git push -u origin main
```

## Notes

- `.env` is ignored and should not be pushed
- `.vercel` is ignored
- `dist/` and `node_modules/` are ignored
