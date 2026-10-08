# Showcase deployment on Vercel (before HostPinnacle)

Vercel has no permanent disk, so for the showcase: database on **Neon**, photos/uploads on **Vercel Blob**.
The app switches to Blob automatically when `BLOB_READ_WRITE_TOKEN` is set. On HostPinnacle leave it empty.

Hobby plan is for non-commercial use; fine for a client preview, but use a Pro plan or HostPinnacle for the real launch.
Vercel limits a single upload request to about 4.5 MB, so keep photos under 4 MB on the showcase.

## 1. Put the code on GitHub
```powershell
cd C:\Dev\mtti-site
git init
git add .
git commit -m "MTTI website"
```
Create an empty **private** repo on github.com, then:
```powershell
git remote add origin https://github.com/YOUR-USER/mtti-site.git
git branch -M main
git push -u origin main
```
`.env` and `storage/` are ignored, so passwords and photos are not pushed.

## 2. Database (Neon)
Create a Neon project (new one, not the old pasted password) and copy the pooled connection string.
Your Wi-Fi blocks Neon, so use a phone hotspot for steps 2 and 5.
```powershell
npm run db:export          # writes a backup folder from your local database
$env:DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
npm run db:import -- mtti-backup-YYYY-MM-DD.zip   # the file name db:export printed
```

## 3. Blob store
Vercel dashboard > Storage > Create > Blob (public). Copy `BLOB_READ_WRITE_TOKEN`.

## 4. Import to Vercel
Add New > Project > pick the repo. Environment variables:

| Name | Value |
|---|---|
| DATABASE_URL | Neon connection string |
| AUTH_SECRET | a long random string |
| AUTH_TRUST_HOST | true |
| NEXT_PUBLIC_SITE_URL | the *.vercel.app URL for now |
| BLOB_READ_WRITE_TOKEN | from step 3 |

Deploy.

## 5. Push the existing photos to Blob
```powershell
$env:BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
npm run blob:push
```
Safe to re-run.

## 6. Check
Open the site, log in at /admin, upload a photo, confirm it shows after a refresh.

## Moving to HostPinnacle later
`npm run db:export` from the Neon database, import on the new host, copy the photos back with the export folder's `uploads/`
(download from Blob or keep your local `storage/uploads`), leave `BLOB_READ_WRITE_TOKEN` empty and set `UPLOAD_DIR`.
Stored URLs are `/uploads/...` in both modes, so nothing in the content changes.
