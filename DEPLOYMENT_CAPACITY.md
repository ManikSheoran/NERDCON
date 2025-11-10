# Deployment Capacity Analysis for 400 Concurrent Users

## ONE-DAY EVENT

## ✅ Railway Free Plan for One-Day Event

### Railway Free Plan for Single Day

- **Memory**: 512MB RAM
- **CPU**: Shared (throttled)
- **Hours**: 500/month = **20.8 days of 24/7 operation** ✅
- **For ONE DAY**: No problem with execution hours! ✅
- **Estimated Capacity**: **50-100 concurrent users MAX** ⚠️

### MongoDB Atlas Free Tier (512MB)

- **Storage**: 512MB ✅ (sufficient for your data)
- **Connections**: ~100 concurrent connections ❌ (bottleneck)
- **Performance**: Throttled under heavy load ⚠️

---

## 🎯 Revised Assessment for One-Day Event

### Good News:

✅ Railway free tier hours are NOT an issue for one day
✅ Your optimizations (caching, pooling) help significantly
✅ 400 teams total is manageable if NOT all active simultaneously

### Reality Check:

- **400 concurrent users** = All 400 teams online at exact same time
- **400 total teams** = Much more manageable if staggered

**Key Question**: Are all 400 teams active at the SAME TIME, or 400 teams total throughout the day?

---

## 📊 Realistic Scenarios

### Scenario 1: 400 Teams Total (Staggered Activity)

**Peak concurrent users**: ~100-150 (25-35% of total)

- **Railway Free**: ✅ Should handle this
- **MongoDB Free**: ✅ With caching, should work
- **Recommendation**: **Stay on free tier, monitor closely**

### Scenario 2: 400 Teams All Active Simultaneously

**Peak concurrent users**: 400

- **Railway Free**: ❌ Will crash (RAM exhausted)
- **MongoDB Free**: ❌ Will hit connection limit
- **Recommendation**: **Must upgrade**

---

## ✅ Optimizations Added

### 1. **Connection Pooling**

- MaxPoolSize: 20 (prevents overwhelming MongoDB free tier)
- MinPoolSize: 5 (keeps connections ready)
- Timeouts configured for better failure handling

### 2. **Leaderboard Caching**

- 10-second in-memory cache
- Reduces DB queries by ~90% (most frequent endpoint)
- Automatically refreshes every 10 seconds

### 3. **Atomic Operations**

- Race condition protection for concurrent submissions
- Single DB operation instead of read-modify-write

### 4. **Query Optimizations**

- `.lean()` on queries (returns plain objects, faster)
- Limited projections (only fetch needed fields)
- Indexed fields (score, penalties for sorting)

---

## 🎯 Recommendations for 400 Concurrent Users

### Option 1: Upgrade Plans (Recommended)

**Railway:**

- **Hobby Plan**: $5/month
  - 8GB RAM
  - Dedicated CPU
  - **Can handle 200-300 concurrent users**

**MongoDB Atlas:**

- **M10 Cluster**: $57/month
  - 2GB RAM
  - 1500 connections
  - **Can handle 400+ concurrent users**

**Total Cost**: ~$62/month

### Option 2: Stay on Free Tier (Budget Option)

**Limitations:**

- Max 50-100 concurrent users reliably
- May experience slowdowns during peak load
- Service interruptions if exceeding free tier limits

**Additional Free Optimizations:**

1. **Add Redis/Upstash** (free tier) for better caching
2. **CloudFlare CDN** (free) for static assets
3. **Rate limiting** (already optimized in code)
4. **Deploy frontend on Vercel** (free, unlimited bandwidth)

### Option 3: Hybrid Approach (Best Value)

- **Frontend**: Vercel (Free) ✅
- **Backend**: Railway Hobby ($5) ✅
- **Database**: MongoDB Atlas Free (512MB) ⚠️
- **Add**: Upstash Redis Free for caching ✅

**Estimated Capacity**: 150-200 concurrent users
**Cost**: $5/month

---

## 📊 Load Testing Before Event

### Test with Artillery or k6:

```bash
npm install -g artillery

# Test leaderboard endpoint
artillery quick --count 100 --num 10 https://your-api.railway.app/api/game/leaderboard

# Test submission endpoint (requires auth)
artillery quick --count 50 --num 5 https://your-api.railway.app/api/game/submit
```

### Monitor During Event:

1. Railway Dashboard: CPU, Memory usage
2. MongoDB Atlas: Connection count, operations
3. Have fallback: Static leaderboard page if DB overwhelmed

---

## 🚨 Critical Warnings for One-Day Event

### Railway Free Tier Risk

- ✅ **500 hours/month** is plenty for one day
- ⚠️ **512MB RAM** will crash at ~100 concurrent users
- ❌ **Shared CPU** will throttle under load
- **Impact**: Users see errors, slow responses, timeouts

### MongoDB Free Tier Risk

- ⚠️ **100 connection limit** is hard cap
- With optimizations (caching, pooling): Can handle 150-200
- **Impact**: "Too many connections" errors during peak

### What Happens if You Exceed Capacity?

1. **50-100 users**: Everything works fine ✅
2. **100-150 users**: Slower responses, occasional timeouts ⚠️
3. **150-200 users**: Frequent errors, some submissions fail ❌
4. **200+ users**: System becomes unusable ❌❌

---

## 💰 Cost-Benefit Analysis

### Stay Free ($0)

- **Risk**: Medium-High (depends on actual concurrency)
- **Capacity**: 80-120 concurrent users safely
- **Downside**: May crash during event, bad user experience
- **Upside**: $0 cost

### Upgrade to Railway Hobby ($5)

- **Risk**: Low (handles 200-250 users)
- **Capacity**: 200-250 concurrent users
- **Downside**: $5 cost
- **Upside**: Reliable event, worth it for peace of mind
- **After event**: Downgrade back to free

**My recommendation: Spend the $5. It's cheaper than having a failed event.**

---

## 💡 Budget-Friendly Strategy for One-Day Event

### Option A: Free Tier with Risk Management ($0)

**Setup:**

- Railway Free + MongoDB Free
- Deploy frontend on Vercel Free

**Capacity**: 80-120 concurrent users comfortably

**Risk Mitigation:**

1. **Staggered start times** (different teams start at different hours)
2. **Increase cache TTL** to 30 seconds during peak
3. **Rate limiting** on expensive endpoints
4. **Static backup leaderboard** (update every 2 minutes)
5. **Have credit card ready** for emergency upgrade

**When to use**: If you expect <150 peak concurrent users

---

### Option B: Minimal Upgrade ($5 for one month)

**Setup:**

- **Railway Hobby**: $5/month
- MongoDB Free
- Vercel Free for frontend

**Capacity**: 200-250 concurrent users ✅

**Benefits:**

- 8GB RAM (16x more than free)
- Dedicated CPU
- No execution hour limits
- Worth $5 for peace of mind

**When to use**: If you expect 150-250 peak concurrent users

---

### Option C: Full Upgrade ($14 for one month)

**Setup:**

- Railway Hobby: $5
- **MongoDB M2**: $9
- Vercel Free

**Capacity**: 350-400 concurrent users ✅✅

**Benefits:**

- 500 MongoDB connections (vs 100)
- Better database performance
- Can handle all 400 if they're truly concurrent

**When to use**: If ALL 400 teams will be active simultaneously

---

## 🎯 My Recommendation for One-Day Event

### Best Value: **Option B ($5)**

**Why:**

1. Most events have **30-40% peak concurrency**, not 100%
2. Railway Hobby ($5) eliminates main bottleneck
3. MongoDB Free can handle 150-200 with caching
4. **Only $5 risk** vs potential event failure
5. Cancel after event, no ongoing cost

### Before Event Day:

1. ✅ Keep free tier during testing/development
2. ✅ 48 hours before event: Upgrade to Railway Hobby ($5)
3. ✅ Load test with 200 simulated users
4. ✅ If test fails: Add MongoDB M2 ($9) → Total $14

---

## 📊 Expected Load Patterns (One-Day Event)

### Typical Distribution:

- **Hour 0-1**: 60% of teams join (240 users)
- **Hour 2-4**: Peak activity (150-200 concurrent)
- **Hour 5-8**: Declining (100-150 concurrent)
- **Hour 9+**: Finishing up (50-100 concurrent)

**Peak concurrent**: ~200 users (50% of 400 teams)

### With Railway Hobby + MongoDB Free:

✅ Should handle this comfortably with optimizations

---

## 📝 Pre-Event Checklist

- [ ] Load test with expected user count
- [ ] Monitor MongoDB connection count
- [ ] Set up alerts in Railway/MongoDB dashboards
- [ ] Have static HTML leaderboard as backup
- [ ] Test race conditions with multiple devices
- [ ] Configure CORS for production domain
- [ ] Set up error logging (Sentry free tier)
- [ ] Document scaling procedures
- [ ] Have credit card ready for emergency upgrades

---

## 🔧 Emergency Scaling During Event

If system crashes during event:

1. **Immediate**: Upgrade Railway to Hobby ($5)
2. **If still issues**: Upgrade MongoDB to M2 ($9)
3. **If database struggles**: Increase cache TTL to 30 seconds
4. **If submissions fail**: Increase connection pool to 50
5. **Last resort**: Disable leaderboard, show static page

**Total emergency cost**: ~$15 for one month
