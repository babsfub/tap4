// src/lib/db/index.ts
import { createPool } from '@vercel/postgres';
// ou utilisez votre système de base de données préféré

const db = createPool({
  connectionString: import.meta.env.VITE_DATABASE_URL,
});

export default db;