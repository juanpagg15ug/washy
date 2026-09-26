require('dotenv').config({ path: '../../.env' });
const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { categories } = require('washy-core/src/db/schema');
const { eq } = require('drizzle-orm');

async function fix() {
  const client = createClient({
    url: process.env.EXPO_PUBLIC_TURSO_URL,
    authToken: process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN
  });
  const db = drizzle(client);

  await db.update(categories).set({ name: '⚡ Tech (Gym/Sintético)' }).where(eq(categories.id, 'cat-tech'));
  await db.update(categories).set({ name: '☁️ Soft (Toallas/Sábanas)' }).where(eq(categories.id, 'cat-soft'));
  await db.update(categories).set({ name: '🛡️ Armor (Jeans/Pesado)' }).where(eq(categories.id, 'cat-armor'));

  console.log('Fixed categories!');
  process.exit(0);
}
fix().catch(console.error);