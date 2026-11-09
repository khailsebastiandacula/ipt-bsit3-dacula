import { Hono } from "hono";
import {
  getAnnouncements,
  getLocations,
} from "../controllers/public.controller.js";

const publicRoute = new Hono();

publicRoute.get("/locations", getLocations);
publicRoute.get("/announcements", getAnnouncements);

export default publicRoute;
