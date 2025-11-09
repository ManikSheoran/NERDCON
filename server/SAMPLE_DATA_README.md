# Sample Data - Game Setup Guide

## Game Structure

The game consists of:

- **Regular Hints**: Each can have 1 or 2 correct answers
- **Final Hint**: The last hint, which has exactly 1 correct answer

When teams complete all regular hints, they unlock the final hint. Completing the final hint marks the game as complete.

## How to Add Data

### Option 1: Using the sample-data.js script

```bash
# In the server directory
node sample-data.js
```

### Option 2: Manual Entry via MongoDB Shell or Compass

## Step 1: Add Pins First

```javascript
// Add pins to the 'pins' collection
db.pins.insertMany([
  {
    pin_id: 1,
    name: "Central Library",
    location: {
      type: "Point",
      coordinates: [-122.4194, 37.7749], // [longitude, latitude]
    },
  },
  {
    pin_id: 2,
    name: "Science Museum",
    location: {
      type: "Point",
      coordinates: [-122.4184, 37.7739],
    },
  },
  {
    pin_id: 3,
    name: "Grand Hall",
    location: {
      type: "Point",
      coordinates: [-122.4204, 37.7759],
    },
  },
]);
```

## Step 2: Get Pin MongoDB IDs

```javascript
// Find pins and note their _id values
db.pins.find({}, { pin_id: 1, name: 1, _id: 1 });

// Example output:
// { "_id": ObjectId("6543210abcdef1234567890a"), "pin_id": 1, "name": "Central Library" }
// { "_id": ObjectId("6543210abcdef1234567890b"), "pin_id": 2, "name": "Science Museum" }
// { "_id": ObjectId("6543210abcdef1234567890c"), "pin_id": 3, "name": "Grand Hall" }
```

## Step 3: Add Hints with Pin References

```javascript
// Replace the ObjectId values with the actual _id values from Step 2
db.hints.insertMany([
  // Regular hint with 1 answer
  {
    hint_id: 1,
    imagePath: "hint1.jpg", // Place hint1.jpg in the hints folder
    scoreValue: 100,
    correctPins: [
      ObjectId("6543210abcdef1234567890a"), // pin_id: 1 (Central Library)
    ],
    isFinalHint: false,
  },
  // Regular hint with 2 answers
  {
    hint_id: 2,
    imagePath: "hint2.jpg", // Place hint2.jpg in the hints folder
    scoreValue: 100,
    correctPins: [
      ObjectId("6543210abcdef1234567890b"), // pin_id: 2 (Science Museum)
      ObjectId("6543210abcdef1234567890c"), // pin_id: 3 (Grand Hall) - 2 correct answers!
    ],
    isFinalHint: false,
  },
  // FINAL HINT - Must have exactly 1 answer
  {
    hint_id: 3,
    imagePath: "hint3_final.jpg", // Place hint3_final.jpg in the hints folder
    scoreValue: 200,
    correctPins: [
      ObjectId("6543210abcdef1234567890c"), // pin_id: 3 (Grand Hall)
    ],
    isFinalHint: true, // THIS MARKS IT AS THE FINAL HINT
  },
]);
```

## Quick Reference Format

### Pin Structure:

```javascript
{
  pin_id: <number>,           // Unique, easy to remember ID
  name: "<string>",           // Display name
  location: {
    type: "Point",
    coordinates: [lng, lat]   // [longitude, latitude] - NOTE: longitude first!
  }
}
```

### Hint Structure:

```javascript
{
  hint_id: <number>,                 // Unique, easy to remember ID
  imagePath: "<filename>",           // Image filename (e.g., "hint1.jpg")
  scoreValue: <number>,              // Points for this hint (default: 100)
  correctPins: [ObjectId(...), ...], // Array of 1 or 2 pin _id references
  isFinalHint: <boolean>             // true for the final hint, false for regular hints
}
```

## Important Notes:

1. **Coordinates Order**: Always use [longitude, latitude] - NOT [lat, lng]!

   - Example: San Francisco = [-122.4194, 37.7749]

2. **Pin IDs**: Use simple numbers (1, 2, 3...) for easy reference

3. **Hint IDs**: Use simple numbers (1, 2, 3...) for easy reference

4. **Hint Images**:

   - Place all hint images in the `server/hints/` folder
   - Supported formats: .jpg, .png, .gif, .webp
   - Use simple names like: hint1.jpg, hint2.png, hint3_final.jpg
   - Images will be accessible at: `http://localhost:4000/hints/hint1.jpg`

5. **Multiple Answers**: Regular hints can have 1 or 2 correct pins in the `correctPins` array

6. **Final Hint**:

   - Must be the LAST hint in the sequence
   - Must have `isFinalHint: true`
   - Should have exactly 1 correct answer
   - Usually has a higher score value (e.g., 200 points)
   - Completing it shows a "game completed" message

7. **Always add Pins BEFORE Hints** since hints reference pin MongoDB ObjectIds

## Game Flow:

1. Teams receive hints one at a time
2. For each hint, they can submit answers
3. Correct answer → move to next hint
4. Wrong answer → add penalty, stay on same hint
5. After completing all regular hints → get the final hint
6. Completing the final hint → game complete!

## Testing Your Data

```javascript
// Verify pins
db.pins.find().pretty();

// Verify hints (with populated pin data)
db.hints.aggregate([
  {
    $lookup: {
      from: "pins",
      localField: "correctPins",
      foreignField: "_id",
      as: "pins_data",
    },
  },
]);

// Check which hint is the final one
db.hints.find({ isFinalHint: true });
```
