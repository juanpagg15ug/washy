import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import * as schema from 'washy-core/src/db/schema';

// Cliente HTTP de libSQL (Turso) que funciona en Web, iOS y Android
const tursoClient = createClient({
  url: process.env.EXPO_PUBLIC_TURSO_URL!,
  authToken: process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN!,
});

export const db = drizzle(tursoClient, { schema });

