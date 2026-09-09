import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { washRules, categories } from 'washy-core/src/db/schema';

const client = createClient({
  url: 'libsql://washytest-juanpagg15ug.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg5NjQ0OTgsImlkIjoiMDFhMDg2OTAtMDkwMS03MWNlLThlZTItNDQzZTMwZjI1ZDU2Iiwia2lkIjoiOTB3bEZPZnZHbmljZjVYd1dfX0FNay11ODlfb0ViVVJtTkQ1eGRSekNCOCIsInJpZCI6Ijg5MDI5YjljLTA5YTEtNDEyMC1iMjFlLTI3MmI3Njc0NDY1MyJ9.k-Z75FEtoM4mCkIt0GjesAi8h5ZgfK4yHCFQPVx326XKXwCMAEwYpfMg9JcHXyLmxo-oJza_LnaM29RZP_StCw'
});
const db = drizzle(client);

async function seed() {
  console.log('Seeding wash rules into washytest...');
  await db.insert(washRules).values([
    { id: 'rule-express', name: 'Express Tibio (Default)', waterTemp: 'WARM', cycleType: 'EXPRESS', baseDurationMins: 30 },
    { id: 'rule-delicate', name: 'Delicado Frio', waterTemp: 'COLD', cycleType: 'DELICATE', baseDurationMins: 20 },
    { id: 'rule-heavy', name: 'Pesado Tibio', waterTemp: 'WARM', cycleType: 'HEAVY', baseDurationMins: 45 }
  ]).onConflictDoNothing();

  console.log('Seeding categories into washytest...');
  await db.insert(categories).values([
    { id: 'cat-tech', name: '? Tech (Gym/Sintético)', colorHex: '#00D1B2', defaultWashRuleId: 'rule-express' },
    { id: 'cat-soft', name: '?? Soft (Toallas/Sábanas)', colorHex: '#B8E986', defaultWashRuleId: 'rule-delicate' },
    { id: 'cat-armor', name: '??? Armor (Jeans/Pesado)', colorHex: '#4A90E2', defaultWashRuleId: 'rule-heavy' }
  ]).onConflictDoNothing();

  console.log('Done seeding washytest!');
  process.exit(0);
}

seed().catch(console.error);
