/**
 * Fix Username Index - Migration Script
 * 
 * This script drops the existing username index and recreates it as a sparse unique index.
 * This allows multiple users to have username: null (for Google OAuth users) without
 * triggering duplicate key errors.
 * 
 * Run with: node fix-username-index.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function fixUsernameIndex() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('\n📋 Current indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), 
        index.unique ? '(unique)' : '', 
        index.sparse ? '(sparse)' : '');
    });

    // Check if username_1 index exists
    const usernameIndex = indexes.find(idx => idx.name === 'username_1');
    
    if (usernameIndex) {
      console.log('\n🔍 Found username_1 index');
      
      // Check if it's already sparse
      if (usernameIndex.sparse) {
        console.log('✅ Index is already sparse - no changes needed!');
      } else {
        console.log('⚠️  Index is NOT sparse - needs to be recreated');
        
        // Drop the existing index
        console.log('\n🗑️  Dropping existing username_1 index...');
        await usersCollection.dropIndex('username_1');
        console.log('✅ Dropped username_1 index');
        
        // Create new sparse unique index
        console.log('\n🔨 Creating new sparse unique index on username...');
        await usersCollection.createIndex(
          { username: 1 },
          { 
            unique: true, 
            sparse: true,
            name: 'username_1'
          }
        );
        console.log('✅ Created sparse unique index on username');
      }
    } else {
      console.log('\n⚠️  username_1 index not found - creating it...');
      await usersCollection.createIndex(
        { username: 1 },
        { 
          unique: true, 
          sparse: true,
          name: 'username_1'
        }
      );
      console.log('✅ Created sparse unique index on username');
    }

    // Verify the new index
    console.log('\n📋 Updated indexes:');
    const updatedIndexes = await usersCollection.indexes();
    updatedIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), 
        index.unique ? '(unique)' : '', 
        index.sparse ? '(sparse)' : '');
    });

    // Check for users with null usernames
    console.log('\n🔍 Checking for users with null usernames...');
    const nullUsernameCount = await usersCollection.countDocuments({ username: null });
    console.log(`   Found ${nullUsernameCount} user(s) with null username`);

    // Check for Google OAuth users
    const googleUsersCount = await usersCollection.countDocuments({ authProvider: 'google' });
    console.log(`   Found ${googleUsersCount} Google OAuth user(s)`);

    console.log('\n✅ Username index fix completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - Username field now has sparse unique index');
    console.log('   - Multiple users can have username: null');
    console.log('   - Google OAuth users will not trigger duplicate key errors');
    console.log('   - Local users still have unique username requirement');

  } catch (error) {
    console.error('\n❌ Error fixing username index:', error);
    
    if (error.code === 11000) {
      console.error('\n⚠️  Duplicate key error detected!');
      console.error('   This means you have multiple users with the same username.');
      console.error('   Please clean up duplicate usernames before running this script.');
      console.error('\n   To find duplicates, run:');
      console.error('   db.users.aggregate([');
      console.error('     { $group: { _id: "$username", count: { $sum: 1 } } },');
      console.error('     { $match: { count: { $gt: 1 } } }');
      console.error('   ])');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
console.log('🚀 Starting username index fix...\n');
fixUsernameIndex();
