const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { categories } = require('washy-core/src/db/schema');
const { eq } = require('drizzle-orm');

async function fix() {
  const client = createClient({
    url: 'libsql://washytest-juanpagg15ug.aws-us-east-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg5NjQ0OTgsImlkIjoiMDFhMDg2OTAtMDkwMS03MWNlLThlZTItNDQzZTMwZjI1ZDU2Iiwia2lkIjoiOTB3bEZPZnZHbmljZjVYd1dfX0FNay11ODlfb0ViVVJtTkQ1eGRSekNCOCIsInJpZCI6Ijg5MDI5YjljLTA5YTEtNDEyMC1iMjFlLTI3MmI3Njc0NDY1MyJ9.k-Z75FEtoM4mCkIt0GjesAi8h5ZgfK4yHCFQPVx326XKXwCMAEwYpfMg9JcHXyLmxo-oJza_LnaM29RZP_StCw'
  });
  const db = drizzle(client);

  await db.update(categories).set({ name: '⚡ Tech (Gym/Sintético)' }).where(eq(categories.id, 'cat-tech'));
  await db.update(categories).set({ name: '☁️ Soft (Toallas/Sábanas)' }).where(eq(categories.id, 'cat-soft'));
  await db.update(categories).set({ name: '🛡️ Armor (Jeans/Pesado)' }).where(eq(categories.id, 'cat-armor'));

  console.log('Fixed categories!');
  process.exit(0);
}
fix().catch(console.error);