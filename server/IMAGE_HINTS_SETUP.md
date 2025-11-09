# Image-Based Hints Setup Guide

The game now uses **images** instead of text for hints. Follow these steps to set up your hints:

## 1. Prepare Your Hint Images

Create visual clues/puzzles as images. For example:

- A photo of a location
- A map with markers
- A puzzle or riddle image
- Symbols or icons that hint at the location

### Image Requirements:

- **Format**: JPG, PNG, GIF, or WebP
- **Resolution**: Minimum 800x600px recommended
- **File Size**: Keep under 2MB for faster loading
- **Naming**: Use simple names like `hint1.jpg`, `hint2.png`, etc.

## 2. Add Images to Server

Place your hint images in the `server/hints/` folder:

```
server/
  hints/
    hint1.jpg
    hint2.jpg
    hint3.jpg
    hint4.jpg
    hint5_final.jpg
    README.md
```

## 3. Create Database Entries

When adding hints to the database, use the `imagePath` field:

```javascript
{
  hint_id: 1,
  imagePath: "hint1.jpg",  // Just the filename, not the full path
  scoreValue: 100,
  correctPins: [pin1._id],
  isFinalHint: false
}
```

## 4. Test Image Access

After starting the server, you can test if images are accessible:

```
http://localhost:4000/hints/hint1.jpg
http://localhost:4000/hints/hint2.jpg
```

If you can see the image in your browser, it's set up correctly!

## 5. Run the Sample Data Script

If using the sample data script:

1. Place your images in `server/hints/` folder first
2. Update `sample-data.js` with your image filenames
3. Run: `node sample-data.js`

## How It Works

### Backend:

- Images stored in `server/hints/` folder
- Express serves them as static files via `/hints` route
- Database stores only the filename (not full path)

### Frontend:

- Displays images instead of text
- Fetches images from: `http://localhost:4000/hints/{imagePath}`
- Shows error message if image not found

## Example Complete Setup

**Step 1**: Add images to `server/hints/`:

- `hint1.jpg` - Photo of a library
- `hint2.jpg` - Science lab equipment
- `hint3_final.jpg` - Grand hall entrance

**Step 2**: Add to database:

```javascript
db.hints.insertMany([
  {
    hint_id: 1,
    imagePath: "hint1.jpg",
    scoreValue: 100,
    correctPins: [libraryPin._id],
    isFinalHint: false,
  },
  {
    hint_id: 2,
    imagePath: "hint2.jpg",
    scoreValue: 100,
    correctPins: [sciencePin._id, techPin._id],
    isFinalHint: false,
  },
  {
    hint_id: 3,
    imagePath: "hint3_final.jpg",
    scoreValue: 200,
    correctPins: [hallPin._id],
    isFinalHint: true,
  },
]);
```

**Step 3**: Start server and test!

## Troubleshooting

### Image not showing:

1. Check if image exists in `server/hints/` folder
2. Verify filename matches exactly (case-sensitive)
3. Check server logs for errors
4. Test direct URL: `http://localhost:4000/hints/hint1.jpg`

### Server not serving images:

1. Make sure `app.js` has the static middleware:
   ```javascript
   app.use("/hints", express.static(path.join(__dirname, "hints")));
   ```
2. Restart the server

### Wrong image path in database:

- Use only the filename, not full path
- Correct: `"hint1.jpg"`
- Wrong: `"/hints/hint1.jpg"` or `"./hints/hint1.jpg"`
