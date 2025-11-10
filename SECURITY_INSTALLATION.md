# Security Fixes Installation Guide

## 🚀 Quick Installation (5 minutes)

### Step 1: Install Security Packages

```bash
cd server
npm install helmet express-rate-limit express-mongo-sanitize express-validator
```

### Step 2: Replace Files

#### Option A: Manual Updates (Recommended for understanding changes)

1. **Update app.js**

   - Copy code from `app-secure.js`
   - Replace your `app.js` with secure version
   - Or manually add the security middleware

2. **Update authController.js**

   - Copy code from `authController-secure.js`
   - Replace your `authController.js`
   - Add validation exports

3. **Update authRoutes.js**
   - Copy code from `authRoutes-secure.js`
   - Replace your `authRoutes.js`
   - Add validation middleware to routes

#### Option B: Quick Replace (Faster but read the code first!)

```bash
# Backup originals
cp app.js app.js.backup
cp controllers/authController.js controllers/authController.js.backup
cp routes/authRoutes.js routes/authRoutes.js.backup

# Replace with secure versions
cp app-secure.js app.js
cp controllers/authController-secure.js controllers/authController.js
cp routes/authRoutes-secure.js routes/authRoutes.js
```

### Step 3: Update Environment Variables

Add to your `.env` file:

```env
NODE_ENV=production
JWT_SECRET=your-very-strong-secret-key-at-least-32-characters-long-random-string
```

**IMPORTANT**: Generate a strong JWT_SECRET:

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Step 4: Test Locally

```bash
npm run dev
```

Test these endpoints:

1. **Rate limiting**: Try login 6 times quickly → Should block after 5
2. **Validation**: Try registration with short password → Should reject
3. **NoSQL injection**: Try login with `{"email": {"$ne": null}}` → Should reject
4. **Large payload**: Send 1MB JSON → Should reject

### Step 5: Deploy to Railway

```bash
# Push to git
git add .
git commit -m "Add security fixes"
git push

# Railway will auto-deploy

# Add environment variables in Railway dashboard:
NODE_ENV=production
JWT_SECRET=<your-generated-secret>
```

---

## 🔍 What Each Fix Does

### 1. Helmet (Security Headers)

```javascript
app.use(helmet());
```

- Prevents XSS attacks
- Prevents clickjacking
- Adds secure headers
- Protects against MIME sniffing

### 2. Rate Limiting

```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});
```

- Prevents brute force attacks
- Limits login attempts to 5 per 15 minutes
- Limits API requests to 100 per 15 minutes
- Limits submissions to 10 per minute

### 3. Input Validation

```javascript
body("email").trim().isNumeric();
```

- Validates phone numbers are numeric
- Validates password length
- Sanitizes inputs
- Prevents injection attacks

### 4. MongoDB Sanitization

```javascript
app.use(mongoSanitize());
```

- Removes $ and . from user input
- Prevents NoSQL injection
- Example: `{"email": {"$ne": null}}` → `{"email": {"ne": null}}`

### 5. Body Size Limit

```javascript
app.use(express.json({ limit: "10kb" }));
```

- Prevents memory exhaustion
- Limits request size to 10KB
- Large payloads rejected immediately

### 6. Error Sanitization

- Production: Generic error messages
- Development: Detailed errors
- Prevents information leakage

---

## 📊 Before vs After

### Before:

```javascript
// ❌ No rate limiting
app.use("/api/auth", authRoutes);

// ❌ No validation
const { email, password } = req.body;

// ❌ Weak bcrypt
bcrypt.hash(password, 10);

// ❌ Long JWT
expiresIn: "7d";

// ❌ Exposed errors
res.status(500).json({ error: e.message });
```

### After:

```javascript
// ✅ Rate limited
app.use("/api/auth", authLimiter, authRoutes);

// ✅ Validated and sanitized
const email = String(req.body.email).trim();

// ✅ Strong bcrypt
bcrypt.hash(password, 12);

// ✅ Short JWT for event
expiresIn: "24h";

// ✅ Generic errors
res.status(500).json({ message: "Please try again" });
```

---

## ✅ Testing Checklist

After applying fixes, test:

- [ ] Login works normally
- [ ] Registration works normally
- [ ] Rate limiting blocks after 5 failed logins
- [ ] Rate limiting resets after 15 minutes
- [ ] Validation rejects invalid inputs
- [ ] NoSQL injection attempts are blocked
- [ ] Large payloads are rejected
- [ ] Error messages don't expose internals
- [ ] JWT expires after 24 hours
- [ ] CORS still works for your frontend
- [ ] All game routes still work
- [ ] Leaderboard caching still works

---

## 🚨 Critical: Change These Before Event

1. **JWT_SECRET**: Must be strong, random, 32+ characters
2. **NODE_ENV**: Set to `production` in Railway
3. **Remove debug routes**: Already handled in secure version
4. **Test rate limits**: Make sure they work

---

## 📞 Emergency Rollback

If something breaks:

```bash
# Restore backups
cp app.js.backup app.js
cp controllers/authController.js.backup controllers/authController.js
cp routes/authRoutes.js.backup routes/authRoutes.js

# Reinstall dependencies
npm install

# Restart server
npm run dev
```

---

## 💡 Additional Recommendations

### Optional but Recommended:

1. **Add logging**:

```bash
npm install winston
```

2. **Add monitoring**:

- Set up Sentry for error tracking (free tier)
- Use Railway logs during event

3. **Add health check endpoint**:

```javascript
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});
```

---

## 📝 Security Checklist for Event Day

- [ ] All security packages installed
- [ ] JWT_SECRET is strong and secret
- [ ] NODE_ENV=production in Railway
- [ ] Rate limiting tested and working
- [ ] CORS configured for production domain
- [ ] MongoDB IP whitelist configured
- [ ] Backup of database created
- [ ] Error logging set up
- [ ] Monitoring dashboard open
- [ ] Emergency contact list ready
- [ ] Rollback procedure documented

---

## ⏱️ Time Required

- **Installation**: 5 minutes
- **Testing**: 10 minutes
- **Deployment**: 5 minutes
- **Total**: 20 minutes

**Don't skip this! 20 minutes of work prevents event disasters.**
