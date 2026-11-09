import mysql from "mysql2/promise";
import pool, { dbConfig, dbName } from "../config/db.js";
const defaultLocations = [
    [
        "CAS",
        "College of Arts and Sciences",
        "College",
        "Liberal arts, sciences, and general education programs",
        "#be123c",
        8.484911723881153,
        124.6391907317562,
        1,
    ],
    [
        "SBMA",
        "School of Business, Management and Accountancy (SBMA)",
        "College",
        "Business administration, management, and accountancy programs",
        "#e11d48",
        8.484971413034941,
        124.63890909981954,
        1,
    ],
    [
        "CRIM",
        "College of Criminal Justice Department",
        "College",
        "Criminology and criminal justice education",
        "#991b1b",
        8.48622,
        124.63912,
        1,
    ],
    [
        "CIT",
        "College of Information Technology",
        "College",
        "BSIT and computer science programs",
        "#dc2626",
        8.486455018202603,
        124.63898181573434,
        1,
    ],
    [
        "LAW",
        "College of Law",
        "College",
        "Juris Doctor and legal education programs",
        "#7f1d1d",
        8.48631,
        124.63933,
        1,
    ],
    [
        "COM",
        "Conservatory of Music",
        "College",
        "Music theory, performance, and composition programs",
        "#ef4444",
        8.486919790756362,
        124.63969048168296,
        1,
    ],
    [
        "HM",
        "Tourism Management / Hospitality Management",
        "College",
        "Tourism and hospitality industry programs",
        "#db2777",
        8.48571,
        124.63969,
        1,
    ],
    [
        "LIB",
        "Main Library",
        "Study Spots",
        "Primary student library and study resources",
        "#1d4ed8",
        8.48578,
        124.63948,
        1,
    ],
    [
        "GYM",
        "Liceo Civic Center (LCC) Gym",
        "Facilities",
        "University sports hall and activity area",
        "#0ea5e9",
        8.4853762,
        124.6389618,
        1,
    ],
    [
        "ROD",
        "Rodelsa Hall",
        "Facilities",
        "Multipurpose hall for events and university activities",
        "#0891b2",
        8.486131653848114,
        124.63890417852365,
        1,
    ],
    [
        "OSA",
        "Office of Student Affairs",
        "Administrative Offices",
        "Student welfare and campus services office",
        "#16a34a",
        8.48562,
        124.63924,
        1,
    ],
    [
        "REG",
        "Registrar's Office",
        "Administrative Offices",
        "Records, enrollment documents, and student registration services",
        "#0369a1",
        8.48584,
        124.63912,
        1,
    ],
    [
        "ADM",
        "Admissions Office",
        "Administrative Offices",
        "Admissions screening and applicant onboarding support",
        "#0284c7",
        8.48573,
        124.63928,
        1,
    ],
    [
        "ACC",
        "Accounting Office",
        "Administrative Offices",
        "Billing, cashier, and payment processing for students",
        "#0f766e",
        8.48546,
        124.63909,
        1,
    ],
    [
        "MIS",
        "ICT Business Solutions (MIS)",
        "Administrative Offices",
        "IT support services and university systems management",
        "#155e75",
        8.48598,
        124.63904,
        1,
    ],
    [
        "PRS",
        "President's Office",
        "Administrative Offices",
        "University executive and administrative leadership office",
        "#7e22ce",
        8.48558,
        124.63914,
        1,
    ],
    [
        "LIBG",
        "Graduate Studies Library",
        "Study Spots",
        "Library services and study space for graduate programs",
        "#2563eb",
        8.487079126277049,
        124.63912692102949,
        1,
    ],
];
const defaultAnnouncements = [
    [
        "Midterm Examination Schedule Released",
        "The midterm examination schedule for all BSIT courses has been posted. Please check your department bulletin board or contact your adviser for details.",
        "HIGH",
        "Registrar Office",
        1,
        "2026-02-10 08:00:00",
    ],
    [
        "Library Extended Hours This Week",
        "The university library will be open until 10 PM from Monday to Friday this week to accommodate students preparing for exams.",
        "NORMAL",
        "Library Services",
        1,
        "2026-02-09 09:30:00",
    ],
    [
        "Campus WiFi Maintenance",
        "Network maintenance scheduled for tonight 11 PM - 2 AM. Campus WiFi will be temporarily unavailable during this period.",
        "URGENT",
        "IT Services",
        1,
        "2026-02-12 16:00:00",
    ],
];
export async function bootstrapDatabase() {
    const adminConnection = typeof dbConfig === "string"
        ? await mysql.createConnection(dbConfig)
        : await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
        });
    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await adminConnection.end();
    await pool.query(`
    CREATE TABLE IF NOT EXISTS locations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(180) NOT NULL,
      category VARCHAR(60) NOT NULL,
      description TEXT NOT NULL,
      color VARCHAR(20) NOT NULL DEFAULT '#dc2626',
      lat DECIMAL(10,7) NULL,
      lng DECIMAL(10,7) NULL,
      is_featured TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
    const [latColumnRows] = await pool.query("SHOW COLUMNS FROM locations LIKE 'lat'");
    if (latColumnRows.length === 0) {
        await pool.query("ALTER TABLE locations ADD COLUMN lat DECIMAL(10,7) NULL AFTER color");
    }
    const [lngColumnRows] = await pool.query("SHOW COLUMNS FROM locations LIKE 'lng'");
    if (lngColumnRows.length === 0) {
        await pool.query("ALTER TABLE locations ADD COLUMN lng DECIMAL(10,7) NULL AFTER lat");
    }
    await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      priority ENUM('LOW','NORMAL','HIGH','URGENT') NOT NULL DEFAULT 'NORMAL',
      author_name VARCHAR(120) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
    const [locationCountRows] = await pool.query("SELECT COUNT(*) AS count FROM locations");
    const locationCount = Number(locationCountRows[0]?.count ?? 0);
    if (locationCount === 0) {
        await pool.query(`INSERT INTO locations (code, name, category, description, color, lat, lng, is_featured)
       VALUES ?`, [defaultLocations]);
    }
    const [announcementCountRows] = await pool.query("SELECT COUNT(*) AS count FROM announcements");
    const announcementCount = Number(announcementCountRows[0]?.count ?? 0);
    if (announcementCount === 0) {
        await pool.query(`INSERT INTO announcements (title, message, priority, author_name, is_active, created_at)
       VALUES ?`, [defaultAnnouncements]);
    }
}
