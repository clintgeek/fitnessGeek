const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Import the BloodPressure model
const BloodPressure = require('../src/models/BloodPressure');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://datageek_admin:DataGeek_Admin_2024@192.168.1.17:27018/fitnessgeek?authSource=admin';

// Function to parse CSV data
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const data = [];

  let currentDate = '';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this is a date line (contains month name and year)
    if (line.match(/"[A-Za-z]{3}\s+\d+,\s+\d{4}"/)) {
      currentDate = line.replace(/"/g, '').trim();
      continue;
    }

    // This should be a data line with time and readings
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));

    if (values.length >= 4 && currentDate) { // We expect at least: time, reading, heart rate, category
      const entry = {
        Time: currentDate + ', ' + values[0],
        Reading: values[1] || '',
        'Heart Rate': values[2] || '',
        Category: values[3] || '',
        Notes: values[4] || ''
      };

      data.push(entry);
    }
  }

  return data;
}

// Function to parse blood pressure reading
function parseBPReading(readingStr) {
  if (!readingStr) return { systolic: null, diastolic: null };

  // Handle formats like "145 Sys / 96 Dia" or "128 Sys / 79 Dia"
  const match = readingStr.match(/(\d+)\s+Sys\s*\/\s*(\d+)\s+Dia/);
  if (match) {
    return {
      systolic: parseInt(match[1]),
      diastolic: parseInt(match[2])
    };
  }

  return { systolic: null, diastolic: null };
}

// Function to parse heart rate
function parseHeartRate(hrStr) {
  if (!hrStr) return null;

  // Handle formats like "96 bpm" or "74 bpm"
  const match = hrStr.match(/(\d+)\s*bpm/);
  if (match) {
    return parseInt(match[1]);
  }

  return null;
}

// Function to parse date and time
function parseDateTime(dateTimeStr) {
  if (!dateTimeStr) return null;

  // Clean up string (remove quotes and extra spaces)
  const cleanStr = dateTimeStr.replace(/"/g, '').trim();

  // Handle format like "Jan 5, 2025, 10:30 AM"
  const fullMatch = cleanStr.match(/(\w+)\s+(\d+),\s+(\d{4}),\s+(\d+):(\d+)\s*(AM|PM)/);
  if (fullMatch) {
    const month = fullMatch[1];
    const day = parseInt(fullMatch[2]);
    const year = parseInt(fullMatch[3]);
    let hour = parseInt(fullMatch[4]);
    const minute = parseInt(fullMatch[5]);
    const period = fullMatch[6];

    // Convert month name to number
    const monthMap = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    const monthNum = monthMap[month];
    if (monthNum === undefined) return null;

    // Handle AM/PM
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    return new Date(year, monthNum, day, hour, minute, 0, 0);
  }

  return null;
}

// Function to determine user ID
async function getUserId() {
  // Return the provided user ID
  return '6818c2bddcf626909f6a93a1';
}

// Main import function
async function importBloodPressureData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get user ID
    const userId = await getUserId();
    console.log(`✅ Using user ID: ${userId}`);

    // Define CSV files to import
    const csvFiles = [
      { name: 'Blood Pressure Dec.csv', month: 'Dec' },
      { name: 'Blood Pressure Jan.csv', month: 'Jan' },
      { name: 'Blood Pressure Feb.csv', month: 'Feb' },
      { name: 'Blood Pressure Mar.csv', month: 'Mar' }
    ];

    let totalImported = 0;
    let totalSkipped = 0;

    for (const fileInfo of csvFiles) {
      const filePath = path.join(__dirname, '../../', fileInfo.name);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${fileInfo.name}`);
        continue;
      }

      console.log(`\n📁 Processing ${fileInfo.name}...`);

      // Read CSV file
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const csvData = parseCSV(csvContent);

            console.log(`Found ${csvData.length} entries in ${fileInfo.name}`);

      // Debug: Show first few entries
      if (csvData.length > 0) {
        console.log('Sample entry:', JSON.stringify(csvData[0], null, 2));
      }

      for (const entry of csvData) {
        try {
          // Parse the data
          const { systolic, diastolic } = parseBPReading(entry.Reading);
          const pulse = parseHeartRate(entry['Heart Rate']);
          const logDate = parseDateTime(entry.Time); // Time column contains both date and time
          const notes = entry.Notes || '';

          // Validate required fields
          if (!systolic || !diastolic || !logDate) {
            console.log(`⚠️  Skipping invalid entry: ${JSON.stringify(entry)}`);
            totalSkipped++;
            continue;
          }

          // Check if entry already exists for this date
          const existingEntry = await BloodPressure.findOne({
            userId,
            log_date: {
              $gte: new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()),
              $lt: new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate() + 1)
            }
          });

          if (existingEntry) {
            console.log(`⚠️  Entry already exists for ${logDate.toDateString()}, skipping...`);
            totalSkipped++;
            continue;
          }

          // Create new blood pressure entry
          const bpEntry = new BloodPressure({
            userId,
            systolic,
            diastolic,
            pulse,
            log_date: logDate,
            notes
          });

          await bpEntry.save();
          console.log(`✅ Imported: ${systolic}/${diastolic}${pulse ? `, pulse: ${pulse}` : ''} on ${logDate.toDateString()}`);
          totalImported++;

        } catch (error) {
          console.error(`❌ Error processing entry: ${JSON.stringify(entry)}`, error.message);
          totalSkipped++;
        }
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`✅ Total imported: ${totalImported}`);
    console.log(`⚠️  Total skipped: ${totalSkipped}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the import
if (require.main === module) {
  importBloodPressureData();
}

module.exports = { importBloodPressureData };