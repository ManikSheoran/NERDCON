# MongoDB Manual Setup Guide

## STEP 1: Add Pins First

### In MongoDB Compass:

1. Connect to your database
2. Select the `pins` collection (create if doesn't exist)
3. Click "Add Data" → "Insert Document"
4. Copy and paste the entire content from `mongodb-pins.json`

### In MongoDB Shell:

```javascript
use nerdcon  // or your database name

db.pins.insertMany([
  {
    "pin_id": 1,
    "name": "Central Library",
    "location": {
      "type": "Point",
      "coordinates": [-122.4194, 37.7749]
    }
  },
  {
    "pin_id": 2,
    "name": "Science Museum",
    "location": {
      "type": "Point",
      "coordinates": [-122.4184, 37.7739]
    }
  },
  {
    "pin_id": 3,
    "name": "Tech Park",
    "location": {
      "type": "Point",
      "coordinates": [-122.4204, 37.7759]
    }
  },
  {
    "pin_id": 4,
    "name": "Innovation Center",
    "location": {
      "type": "Point",
      "coordinates": [-122.4214, 37.7769]
    }
  },
  {
    "pin_id": 5,
    "name": "Digital Hub",
    "location": {
      "type": "Point",
      "coordinates": [-122.4174, 37.7729]
    }
  },
  {
    "pin_id": 6,
    "name": "Grand Hall",
    "location": {
      "type": "Point",
      "coordinates": [-122.4164, 37.7719]
    }
  }
])
```

---

## STEP 2: Get Pin ObjectIds

After inserting pins, you need to get their MongoDB `_id` values.

### In MongoDB Compass:

1. Click on the `pins` collection
2. Look at the documents
3. Copy the `_id` value for each pin (it looks like: `ObjectId("507f1f77bcf86cd799439011")`)

### In MongoDB Shell:

```javascript
db.pins.find({}, { pin_id: 1, name: 1, _id: 1 }).pretty();
```

You'll see output like:

```javascript
{ "_id": ObjectId("6730a1b2c3d4e5f6a7b8c9d0"), "pin_id": 1, "name": "Central Library" }
{ "_id": ObjectId("6730a1b2c3d4e5f6a7b8c9d1"), "pin_id": 2, "name": "Science Museum" }
{ "_id": ObjectId("6730a1b2c3d4e5f6a7b8c9d2"), "pin_id": 3, "name": "Tech Park" }
{ "_id": ObjectId("6730a1b2c3d4e5f6a7b8c9d3"), "pin_id": 4, "name": "Innovation Center" }
{ "_id": ObjectId("6730a1b2c3d4e5f6a7b8c9d4"), "pin_id": 5, "name": "Digital Hub" }
{ "_id": ObjectId("6730a1b2c3d4e5f6a7b8c9d5"), "pin_id": 6, "name": "Grand Hall" }
```

**IMPORTANT**: Write down these ObjectIds! You'll need them for the next step.

---

## STEP 3: Add Hints

Now use the ObjectIds from Step 2 to create hints. Replace the ObjectId values below with YOUR actual ObjectIds.

### In MongoDB Compass:

1. Select the `hints` collection (create if doesn't exist)
2. Click "Add Data" → "Insert Document"
3. Copy the JSON below, **REPLACE THE ObjectId VALUES** with your actual ones, then paste

### In MongoDB Shell:

```javascript
db.hints.insertMany([
  {
    hint_id: 1,
    imagePath: "hint1.png",
    scoreValue: 100,
    correctPins: [
      ObjectId("PASTE_YOUR_PIN_1_ID_HERE"), // pin_id: 1 (Central Library)
    ],
    isFinalHint: false,
  },
  {
    hint_id: 2,
    imagePath: "hint2.png",
    scoreValue: 100,
    correctPins: [
      ObjectId("PASTE_YOUR_PIN_2_ID_HERE"), // pin_id: 2 (Science Museum)
      ObjectId("PASTE_YOUR_PIN_3_ID_HERE"), // pin_id: 3 (Tech Park)
    ],
    isFinalHint: false,
  },
  {
    hint_id: 3,
    imagePath: "hint3_final.png",
    scoreValue: 200,
    correctPins: [
      ObjectId("PASTE_YOUR_PIN_6_ID_HERE"), // pin_id: 6 (Grand Hall)
    ],
    isFinalHint: true,
  },
]);
```

### Example with Real ObjectIds:

```javascript
// This is an EXAMPLE - use YOUR actual ObjectIds!
db.hints.insertMany([
  {
    hint_id: 1,
    imagePath: "hint1.png",
    scoreValue: 100,
    correctPins: [
      ObjectId("6730a1b2c3d4e5f6a7b8c9d0"), // pin_id: 1
    ],
    isFinalHint: false,
  },
  {
    hint_id: 2,
    imagePath: "hint2.png",
    scoreValue: 100,
    correctPins: [
      ObjectId("6730a1b2c3d4e5f6a7b8c9d1"), // pin_id: 2
      ObjectId("6730a1b2c3d4e5f6a7b8c9d2"), // pin_id: 3
    ],
    isFinalHint: false,
  },
  {
    hint_id: 3,
    imagePath: "hint3_final.png",
    scoreValue: 200,
    correctPins: [
      ObjectId("6730a1b2c3d4e5f6a7b8c9d5"), // pin_id: 6
    ],
    isFinalHint: true,
  },
]);
```

---

## STEP 4: Verify Your Data

### Check Pins:

```javascript
db.pins.find().pretty();
```

### Check Hints:

```javascript
db.hints.find().pretty();
```

### Check Hints with Pin Details (Advanced):

```javascript
db.hints
  .aggregate([
    {
      $lookup: {
        from: "pins",
        localField: "correctPins",
        foreignField: "_id",
        as: "pin_details",
      },
    },
  ])
  .pretty();
```

---

## Quick Summary

1. ✅ Insert pins from `mongodb-pins.json`
2. ✅ Get the ObjectId values for each pin
3. ✅ Create hints using those ObjectId values (replace the placeholders)
4. ✅ Make sure image files exist in `server/hints/` folder:
   - `hint1.png`
   - `hint2.png`
   - `hint3_final.png`
5. ✅ Start your server and test!

---

## For MongoDB Compass Users

**Easy Copy-Paste Format for Compass:**

After getting your ObjectIds, here's the format to paste directly into Compass when adding hints:

```json
{
  "hint_id": 1,
  "imagePath": "hint1.png",
  "scoreValue": 100,
  "correctPins": [{ "$oid": "YOUR_PIN_1_OBJECTID_HERE" }],
  "isFinalHint": false
}
```

In Compass, ObjectIds use the format: `{"$oid": "actual_id_string"}`

So if your pin 1 has ObjectId `6730a1b2c3d4e5f6a7b8c9d0`, you'd write:

```json
"correctPins": [
  {"$oid": "6730a1b2c3d4e5f6a7b8c9d0"}
]
```
