# Private store resources

Parchment PDFs live here, outside `public/`, so browsers cannot fetch them
directly. They are streamed only by
`app/api/store/resources/[id]/download/route.ts` after a signed-in customer has
checked the resource out.

Upload PDFs from **Admin → Store → Products → Add/Edit product**; the file
picker stores the file in `private-resources/resources/` and fills in the
product's `download_path` for you.

- Uploaded files are intentionally ignored by Git.
- Keep `resources/` in the deployment. Set `STORE_RESOURCE_DIR` to a persistent
  mounted volume when the app folder is not writable (for example on a
  serverless host).
- The folder must be writable by the Node.js process that runs the app.
