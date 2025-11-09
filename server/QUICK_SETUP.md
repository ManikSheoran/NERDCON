# 🎯 Quick Setup Guide - Copy & Paste into MongoDB

## Files You Need

1. **mongodb-pins.json** - Ready to insert pins
2. **mongodb-hints-template.json** - Template for hints (you need to fill in ObjectIds)
3. **MONGODB_MANUAL_SETUP.md** - Detailed instructions

## Quick Steps

### 1️⃣ Add Pins (Easy - Just Copy & Paste!)

**Using MongoDB Compass:**

1. Open your database
2. Go to `pins` collection
3. Click "ADD DATA" → "Insert Document"
4. Open `mongodb-pins.json` file
5. Copy ALL content and paste into Compass
6. Click "Insert"

**Using MongoDB Shell:**

```bash
mongosh
use nerdcon
```

Then copy and paste from `mongodb-pins.json` wrapped in:

```javascript
db.pins
  .insertMany
  // PASTE CONTENT FROM mongodb-pins.json HERE
  ();
```

### 2️⃣ Get Pin ObjectIds

**In Compass:**

- Look at your pins collection
- Copy the `_id` value for each pin (looks like: `6730a1b2c3d4e5f6a7b8c9d0`)

**In Shell:**

```javascript
db.pins.find({}, { pin_id: 1, name: 1, _id: 1 });
```

Write down the 6 ObjectIds!

### 3️⃣ Add Hints

Open `mongodb-hints-template.json` and:

**For Compass:** Use the top section with `{"$oid": "..."}`
**For Shell:** Use the bottom section with `ObjectId("...")`

Replace all the `REPLACE_WITH_PIN_X_OBJECTID` with your actual ObjectIds from step 2.

Then insert the hints into MongoDB!

### 4️⃣ Verify

```javascript
// Check you have 6 pins
db.pins.count();

// Check you have 3 hints
db.hints.count();

// View all hints
db.hints.find().pretty();
```

### 5️⃣ Make Sure Images Exist

Check that these files exist in `server/hints/` folder:

- ✅ hint1.png
- ✅ hint2.png
- ✅ hint3_final.png

### 6️⃣ Start Server & Test!

```bash
cd server
npm run dev
```

Test image access:

```
http://localhost:4000/hints/hint1.png
http://localhost:4000/debug/hints
```

Done! 🎉

---

## Need More Details?

Read **MONGODB_MANUAL_SETUP.md** for detailed instructions with examples.
