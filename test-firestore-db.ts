import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

async function testAll() {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    console.error('No configuration file found!');
    return;
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  console.log('Project ID:', config.projectId);
  console.log('App ID:', config.appId);
  console.log('Config Database ID:', config.firestoreDatabaseId);

  const app = admin.apps.length === 0 ? admin.initializeApp({
    projectId: config.projectId,
  }) : admin.app();

  console.log('\n--- Testing connection with configured database ID ---');
  try {
    const dbConfigured = getFirestore(app, config.firestoreDatabaseId);
    const snapConfigured = await dbConfigured.collection('users').limit(1).get();
    console.log('SUCCESS with configured DB! Collection size:', snapConfigured.size);
  } catch (err: any) {
    console.error('FAILED with configured DB:', err.message || err);
  }

  console.log('\n--- Testing connection with "(default)" database ---');
  try {
    const dbDefault = getFirestore(app, '(default)');
    const snapDefault = await dbDefault.collection('users').limit(1).get();
    console.log('SUCCESS with (default) DB! Collection size:', snapDefault.size);
  } catch (err: any) {
    console.error('FAILED with (default) DB:', err.message || err);
  }
}

testAll().catch(console.error);
