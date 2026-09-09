import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: 'libsql://washydb-juanpagg15ug.aws-us-east-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg5NjI3ODQsImlkIjoiMDFhMDg2N2ItOGYwMS03NTNmLTgwNzItMmNhZDQzNDFlMGFiIiwia2lkIjoiOTB3bEZPZnZHbmljZjVYd1dfX0FNay11ODlfb0ViVVJtTkQ1eGRSekNCOCIsInJpZCI6IjNkZmYzZDYyLTAwNDYtNDg4MS04YTg0LWUzNTc5ZGE0ZTljOSJ9.HrGD_g0N3BQDW3cOFMqa8vMC7DrOz6rbAZdPAy5Ih4Z2wXyLe3GX7pgLRaFkFIp86BumdH6z6MUPJbh_9QbeCw'
  }
});
