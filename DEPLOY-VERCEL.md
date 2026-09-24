# Upload to GitHub and host on Vercel

You do not need to run the site on your phone. GitHub stores the code. Vercel builds and hosts it.

Do not upload `.env` files or `node_modules`.

## A. Create a GitHub repository

1. On your phone or computer, open [https://github.com/new](https://github.com/new).
2. Repository name: `legal-research-bootcamp`.
3. Set it to **Public** (easier) or Private.
4. Do **not** tick “Add a README”.
5. Click **Create repository**.

## B. Upload the unzipped project

### Option 1 — GitHub website (easiest on a phone)

1. Open the empty repo.
2. Click **uploading an existing file**.
3. From your file manager, open the unzipped `legal-research-bootcamp` folder.
4. Select the project files, including:
   - `frontend/`
   - `backend/`
   - `api/`
   - `package.json`
   - `vercel.json`
   - `README.md`
   - `.gitignore`
5. Do **not** upload:
   - `node_modules`
   - `frontend/node_modules`
   - `backend/node_modules`
   - any `.env` file
   - `frontend/dist`
6. Commit the files.

If the website struggles with many files, use Option 2.

### Option 2 — Termux git

```bash
cd /path/to/legal-research-bootcamp
pkg install git
git init
git add .
git status
```

Confirm no `.env` and no `node_modules` are listed.

```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
git commit -m "Initial bootcamp website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/legal-research-bootcamp.git
git push -u origin main
```

GitHub will ask you to sign in. Use a [personal access token](https://github.com/settings/tokens) as the password.

## C. Deploy on Vercel

1. Open [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New… → Project**.
3. Import `legal-research-bootcamp`.
4. Framework: leave as Other / Vite if detected.
5. Root directory: `.` (the repo root, not `frontend`).
6. Build settings should match `vercel.json`:
   - Install: `npm install --prefix frontend`
   - Build: `npm run build --prefix frontend`
   - Output: `frontend/dist`
7. Open **Environment Variables** and add:

| Name | Value |
|---|---|
| `PAYSTACK_SECRET_KEY` | `sk_test_...` (from Paystack) |
| `PAYSTACK_PUBLIC_KEY` | `pk_test_...` |
| `FRONTEND_URL` | your Vercel URL, e.g. `https://legal-research-bootcamp.vercel.app` |

Add them for Production (and Preview if you want test deploys).

8. Click **Deploy**.

Wait for the build to finish. Open the `.vercel.app` URL.

## D. After the first deploy

1. Copy the live URL, for example `https://legal-research-bootcamp-xxxxx.vercel.app`.
2. In Vercel → Settings → Environment Variables, set `FRONTEND_URL` to that exact URL (no trailing slash).
3. Redeploy once so Paystack can return users to `/confirmation`.
4. In Paystack, use test keys first. Test card: `4084084084084081`.

## E. What success looks like

- Home page opens on the Vercel URL
- `/register` opens
- Paystack checkout opens after you submit the form
- After payment you land on `/confirmation` and see **Registration Successful**

If payment says the secret key is missing, the Vercel env vars were not saved, or you did not redeploy after adding them.
