// Sample data for adding Pins and Hints to the database
// Run this script with: node sample-data.js

const mongoose = require('mongoose');
const Pin = require('./models/Pin');
const Hint = require('./models/Hint');

// Update with your MongoDB connection string
const MONGO_URI = 'mongodb://localhost:27017/nerdcon';

async function addSampleData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - remove if you want to keep existing data)
    // await Pin.deleteMany({});
    // await Hint.deleteMany({});

    // ========== STEP 1: Add Pins ==========
    const pins = [
      {
        pin_id: 1,
        name: "Central Library",
        location: {
          type: "Point",
          coordinates: [-122.4194, 37.7749] 
        }
      },
      {
        pin_id: 2,
        name: "Science Museum",
        location: {
          type: "Point",
          coordinates: [-122.4184, 37.7739]
        }
      },
      {
        pin_id: 3,
        name: "Tech Park",
        location: {
          type: "Point",
          coordinates: [-122.4204, 37.7759]
        }
      },
      {
        pin_id: 4,
        name: "Innovation Center",
        location: {
          type: "Point",
          coordinates: [-122.4214, 37.7769]
        }
      },
      {
        pin_id: 5,
        name: "Digital Hub",
        location: {
          type: "Point",
          coordinates: [-122.4174, 37.7729]
        }
      },
      {
        pin_id: 6,
        name: "Grand Hall",
        location: {
          type: "Point",
          coordinates: [-122.4164, 37.7719]
        }
      }
    ];

    // Insert pins
    const insertedPins = await Pin.insertMany(pins);
    console.log(`✅ Added ${insertedPins.length} pins`);

    // Get the MongoDB _id values for reference
    const pin1 = await Pin.findOne({ pin_id: 1 });
    const pin2 = await Pin.findOne({ pin_id: 2 });
    const pin3 = await Pin.findOne({ pin_id: 3 });
    const pin4 = await Pin.findOne({ pin_id: 4 });
    const pin5 = await Pin.findOne({ pin_id: 5 });
    const pin6 = await Pin.findOne({ pin_id: 6 });

    // ========== STEP 2: Add Hints ==========
    const hints = [
      {
        hint_id: 1,
        text: "Where knowledge is stored in endless rows, and silence is golden where the wisdom flows.",
        scoreValue: 100,
        correctPins: [pin1._id], // Central Library (1 correct answer)
        isFinalHint: false
      },
      {
        hint_id: 2,
        text: "A place where experiments come alive, where innovation and discovery thrive.",
        scoreValue: 100,
        correctPins: [pin2._id, pin3._id], // Science Museum OR Tech Park (2 correct answers)
        isFinalHint: false
      },
      {
        hint_id: 3,
        text: "Where startups are born and ideas take flight, technology shines both day and night.",
        scoreValue: 150,
        correctPins: [pin4._id], // Innovation Center (1 correct answer)
        isFinalHint: false
      },
      {
        hint_id: 4,
        text: "A nexus of connectivity and digital dreams, where the future is built with collaborative teams.",
        scoreValue: 150,
        correctPins: [pin5._id, pin4._id], // Digital Hub OR Innovation Center (2 correct answers)
        isFinalHint: false
      },
      {
        hint_id: 5,
        text: "The ultimate destination where champions gather, the final challenge awaits at the grand hall.",
        scoreValue: 200,
        correctPins: [pin6._id], // Grand Hall - FINAL HINT (1 correct answer only)
        isFinalHint: true
      }
    ];

    // Insert hints
    const insertedHints = await Hint.insertMany(hints);
    console.log(`✅ Added ${insertedHints.length} hints`);

    console.log('\n📊 Summary:');
    console.log('Pins:', insertedPins.map(p => `${p.pin_id}: ${p.name}`));
    console.log('\nHints:');
    for (const hint of insertedHints) {
      const populated = await Hint.findById(hint._id).populate('correctPins');
      const answers = populated.correctPins.map(p => `${p.name} (pin_id: ${p.pin_id})`).join(' OR ');
      const finalLabel = hint.isFinalHint ? ' [FINAL HINT]' : '';
      console.log(`Hint ${hint.hint_id}: ${answers}${finalLabel}`);
    }

    console.log('\n✅ Sample data added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

addSampleData();
