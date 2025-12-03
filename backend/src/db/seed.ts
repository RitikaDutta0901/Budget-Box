// backend/src/db/seed.ts
import { initDb, getPool } from "./connect";
import bcrypt from "bcryptjs";

async function runSeed() {
  try {
    console.log("Starting DB seed...");
    await initDb();
    const pool = getPool();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        budget_data JSONB,
        updated_at TIMESTAMP WITH TIME ZONE
      );
    `);

    const email = "hire-me@anshumat.org";
    const plainPassword = "HireMe@2025!";

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainPassword, salt);

    await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING;`,
      [email, hash]
    );
    await pool.query(`
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        snapshot JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    

    const { rows } = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (!rows.length) throw new Error("Demo user was not created.");
    const userId = rows[0].id;
    const now = new Date().toISOString();

    const defaultBudget = {
      income: 0,
      monthlyBills: 0,
      food: 0,
      transport: 0,
      subscriptions: 0,
      misc: 0,
      updatedAt: now,
    };

    await pool.query(
      `INSERT INTO budgets (user_id, budget_data, updated_at) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO NOTHING;`,
      [userId, JSON.stringify(defaultBudget), now]
    );

    console.log("DB seed completed! Demo login:", email, plainPassword);
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    try {
      const pool = getPool();
      await pool.end();
    } catch {}
    process.exit(0);
  }
}

runSeed();
