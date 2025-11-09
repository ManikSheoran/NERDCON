# Image Loading Troubleshooting Guide

## Quick Checks

### 1. Verify Images Exist

Check that images are in the correct folder:

```
server/hints/hint1.png
server/hints/hint2.png
server/hints/hint3_final.png
```

### 2. Check Server is Running

Make sure the server is running on port 4000:

```bash
cd server
npm run dev
```

You should see: `Server running on port 4000`

### 3. Test Image Direct Access

Open your browser and try to access images directly:

```
http://localhost:4000/hints/hint1.png
http://localhost:4000/hints/hint2.png
http://localhost:4000/hints/hint3_final.png
```

If these URLs don't work, the problem is in the backend setup.
If they DO work, the problem is in the frontend or database.

### 4. Check Database

Verify the hints in your database have the correct imagePath:

```javascript
// In MongoDB shell or Compass
db.hints.find({}, { hint_id: 1, imagePath: 1 });

// Should show:
// { hint_id: 1, imagePath: "hint1.png" }
// { hint_id: 2, imagePath: "hint2.png" }
// { hint_id: 3, imagePath: "hint3_final.png" }
```

### 5. Check Frontend Console

Open browser DevTools (F12) and check the Console and Network tabs:

- Look for any 404 errors for image requests
- Check what URL is being requested
- Look for CORS errors

## Common Issues & Fixes

### Issue 1: 404 Not Found

**Problem**: Images don't exist or wrong path
**Fix**:

- Make sure files are named correctly (case-sensitive!)
- Verify files are in `server/hints/` folder
- Check database has correct filenames

### Issue 2: CORS Error

**Problem**: CORS blocking image requests
**Fix**: CORS should already be configured, but verify the frontend is running on localhost:5173

### Issue 3: Wrong File Extension

**Problem**: Database says `.jpg` but files are `.png`
**Fix**:

- Update database to match actual filenames, OR
- Rename image files to match database

### Issue 4: Server Not Serving Static Files

**Problem**: Static middleware not working
**Fix**: Verify `app.js` has this line BEFORE the route handlers:

```javascript
app.use("/hints", express.static(path.join(__dirname, "hints")));
```

### Issue 5: Wrong Port

**Problem**: Frontend requesting wrong port
**Fix**:

- Check `client/src/pages/Game.jsx` uses `http://localhost:4000/hints/`
- Verify server is running on port 4000

## Step-by-Step Debug Process

1. **Stop both servers** (frontend and backend)

2. **Clear and restart backend**:

   ```bash
   cd server
   npm run dev
   ```

3. **Test direct image access** in browser:

   ```
   http://localhost:4000/hints/hint1.png
   ```

   - ✅ If you see the image: Backend is working!
   - ❌ If 404: Check file exists in `server/hints/` folder

4. **Check your database**:

   - Connect to MongoDB
   - Check `hints` collection
   - Verify `imagePath` field matches your actual filenames

5. **Update database if needed**:

   ```javascript
   // If imagePath is wrong, update it:
   db.hints.updateOne({ hint_id: 1 }, { $set: { imagePath: "hint1.png" } });
   ```

6. **Clear browser cache**:

   - Press Ctrl+Shift+Delete
   - Clear cached images
   - Or use Ctrl+F5 to hard refresh

7. **Restart frontend**:

   ```bash
   cd client
   npm run dev
   ```

8. **Check browser DevTools**:
   - Open DevTools (F12)
   - Go to Network tab
   - Try to load a hint
   - Look at the request URL - does it match your files?

## Quick Fix Script

If you've already run `sample-data.js` with wrong filenames, update the database:

```javascript
// Connect to MongoDB and run:
db.hints.updateMany({}, [
  {
    $set: {
      imagePath: {
        $replaceAll: {
          input: "$imagePath",
          find: ".jpg",
          replacement: ".png",
        },
      },
    },
  },
]);
```

Or simply delete and re-run with the updated sample-data.js:

```bash
# In MongoDB
db.hints.deleteMany({})

# Then run
node sample-data.js
```

## Still Not Working?

Check these:

1. File permissions - can Node.js read the hints folder?
2. Firewall - blocking port 4000?
3. Path issues - are you in the right directory?
4. Node modules - try `npm install` again

## Testing Checklist

- [ ] Images exist in `server/hints/` folder
- [ ] Server is running on port 4000
- [ ] Direct URL works: `http://localhost:4000/hints/hint1.png`
- [ ] Database has correct `imagePath` values
- [ ] Frontend is making requests to correct URL
- [ ] No CORS errors in console
- [ ] No 404 errors in Network tab
