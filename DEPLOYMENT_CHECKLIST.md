# GrowEasy Deployment Checklist

Ensure this checklist is completed before and after deploying to production to guarantee a seamless user experience.

## Before Deploy

- [ ] **Environment Variables:** Double-check that `PORT`, `NODE_ENV=production`, `CORS_ORIGIN`, `AI_PROVIDER`, and API keys are set correctly in your production platform.
- [ ] **Build Passes:** Run `npm run build` locally in the `/client` directory to ensure no compilation errors.
- [ ] **Swagger Works:** Run the backend locally and verify `http://localhost:3000/api-docs/` renders without errors.
- [ ] **Docker Works (if applicable):** Run `docker compose up --build` and verify the containers boot successfully.
- [ ] **Health Endpoint:** Verify `GET /api/v1/health` returns `{"status":"UP"}`.
- [ ] **AI Provider Configured:** Verify the selected `AI_PROVIDER` (e.g., `claude`) has a valid corresponding API key (e.g., `ANTHROPIC_API_KEY`).

## After Deploy

- [ ] **Upload Works:** Attempt to upload a valid CSV file on the live site. Verify it proceeds to the Preview step.
- [ ] **Mapping Works:** Trigger the AI mapping and ensure you receive a mapping matrix back without CORS or Timeout errors.
- [ ] **Execute Works:** Execute the import and verify the Success Summary appears.
- [ ] **API Docs:** Verify `YOUR_BACKEND_URL/api-docs/` is accessible and displays correctly.
- [ ] **Logs:** Check the production logs (Render/Railway/Docker) to ensure there are no startup crashes or unhandled exceptions.
- [ ] **HTTPS:** Verify the frontend and backend are served securely over HTTPS.
- [ ] **CORS:** Verify that API calls from the frontend domain are accepted by the backend domain and that unauthorized domains are blocked.
