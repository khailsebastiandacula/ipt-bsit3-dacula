import pool from "../config/db.js";
export async function getLocations(context) {
    try {
        const search = (context.req.query("search") ?? "").trim();
        const category = (context.req.query("category") ?? "").trim();
        let sql = "SELECT * FROM locations WHERE 1 = 1";
        const params = [];
        if (search) {
            sql += " AND (name LIKE ? OR description LIKE ? OR code LIKE ?)";
            const token = `%${search}%`;
            params.push(token, token, token);
        }
        if (category) {
            sql += " AND category = ?";
            params.push(category);
        }
        sql += " ORDER BY is_featured DESC, name ASC";
        const [rows] = await pool.query(sql, params);
        return context.json(rows, 200);
    }
    catch (error) {
        console.error(error);
        return context.json({ message: "Failed to fetch locations" }, 500);
    }
}
export async function getAnnouncements(context) {
    try {
        const includeInactive = context.req.query("includeInactive") === "true";
        const limit = Math.min(Number(context.req.query("limit") ?? "20"), 100);
        let sql = "SELECT * FROM announcements";
        const params = [];
        if (!includeInactive) {
            sql += " WHERE is_active = 1";
        }
        sql += " ORDER BY created_at DESC LIMIT ?";
        params.push(limit);
        const [rows] = await pool.query(sql, params);
        return context.json(rows, 200);
    }
    catch (error) {
        console.error(error);
        return context.json({ message: "Failed to fetch announcements" }, 500);
    }
}
