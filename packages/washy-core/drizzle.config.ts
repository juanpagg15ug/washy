import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Assuming .env is at the root of the project

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.EXPO_PUBLIC_TURSO_URL!,
    authToken: process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN!
  }
});
