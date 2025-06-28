const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkAndFixDatabaseSchema() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Get the raw collection to see the actual schema
    const db = mongoose.connection.db;
    const subjectsCollection = db.collection('subjects');
    
    // Find all subjects where files contains a string
    const badSubjects = await subjectsCollection.find({
      files: { $elemMatch: { $type: 'string' } }
    }).toArray();
    console.log(`\n🔎 Subjects with string in files array: ${badSubjects.length}`);
    for (const subject of badSubjects) {
      console.log(`- ${subject._id}: ${subject.name}`);
      console.log('  files:', JSON.stringify(subject.files));
    }
    
    // Force-clear all files arrays
    const updateResult = await subjectsCollection.updateMany({}, { $set: { files: [] } });
    console.log(`\n🧹 Force-cleared files arrays for ${updateResult.modifiedCount} subjects.`);
    
    // Show all subjects after update
    const allSubjects = await subjectsCollection.find({}).toArray();
    for (const subject of allSubjects) {
      console.log(`\n📋 Subject: ${subject.name}`);
      console.log('📁 Files field:', JSON.stringify(subject.files));
    }
    
    console.log('\n🎉 Database check and fix completed!');
  } catch (error) {
    console.error('❌ Error checking/fixing database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAndFixDatabaseSchema(); 