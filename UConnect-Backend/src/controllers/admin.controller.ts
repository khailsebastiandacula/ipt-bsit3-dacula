import type { Context } from "hono";
import type { ResultSetHeader } from "mysql2";
import pool from "../config/db.js";
import type {
  AnnouncementModel,
  AnnouncementPayload,
} from "../models/announcement.model.js";

function validatePayload(payload: Partial<AnnouncementPayload>) {
  if (!payload.title || !payload.title.trim()) {
    return "Title is required";
  }

  if (!payload.message || !payload.message.trim()) {
    return "Message is required";
  }

  if (!payload.author_name || !payload.author_name.trim()) {
    return "Author name is required";
  }

  const allowed = ["LOW", "NORMAL", "HIGH", "URGENT"];
  if (!payload.priority || !allowed.includes(payload.priority)) {
    return "Priority must be LOW, NORMAL, HIGH, or URGENT";
  }

  return null;
}

export async function createAnnouncement(context: Context) {
  try {
    const payload = (await context.req.json()) as Partial<AnnouncementPayload>;
    const validationError = validatePayload(payload);

    if (validationError) {
      return context.json({ message: validationError }, 400);
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO announcements (title, message, priority, author_name, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        payload.title!.trim(),
        payload.message!.trim(),
        payload.priority,
        payload.author_name!.trim(),
        payload.is_active === false ? 0 : 1,
      ],
    );

    const [rows] = await pool.query<AnnouncementModel[]>(
      "SELECT * FROM announcements WHERE id = ?",
      [result.insertId],
    );

    return context.json(rows[0], 201);
  } catch (error) {
    console.error(error);
    return context.json({ message: "Failed to create announcement" }, 500);
  }
}

export async function updateAnnouncement(context: Context) {
  try {
    const id = Number(context.req.param("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return context.json({ message: "Invalid announcement ID" }, 400);
    }

    const payload = (await context.req.json()) as Partial<AnnouncementPayload>;
    const validationError = validatePayload(payload);
    if (validationError) {
      return context.json({ message: validationError }, 400);
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE announcements
       SET title = ?, message = ?, priority = ?, author_name = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        payload.title!.trim(),
        payload.message!.trim(),
        payload.priority,
        payload.author_name!.trim(),
        payload.is_active === false ? 0 : 1,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return context.json({ message: "Announcement not found" }, 404);
    }

    const [rows] = await pool.query<AnnouncementModel[]>(
      "SELECT * FROM announcements WHERE id = ?",
      [id],
    );
    return context.json(rows[0], 200);
  } catch (error) {
    console.error(error);
    return context.json({ message: "Failed to update announcement" }, 500);
  }
}

export async function deleteAnnouncement(context: Context) {
  try {
    const id = Number(context.req.param("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return context.json({ message: "Invalid announcement ID" }, 400);
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM announcements WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return context.json({ message: "Announcement not found" }, 404);
    }

    return context.body(null, 204);
  } catch (error) {
    console.error(error);
    return context.json({ message: "Failed to delete announcement" }, 500);
  }
}
