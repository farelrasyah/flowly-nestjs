import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuthRoutes } from "./auth/auth.routes";
import { createTaskRoutes } from "./tasks/task.routes";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup CORS
app.use('*', cors({
  origin: '*', // In production, specify your Flutter app domain
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Register Authentication routes
createAuthRoutes(app);

// Register Task Management routes
createTaskRoutes(app);

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
