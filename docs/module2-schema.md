# **Module 2: Game Mechanics & Storage - Schema Design**

## **🗄️ Data Model Overview**

Using **Vercel KV** (Redis-based) for optimal performance and real-time capabilities.

---

## **📝 Core Data Structures**

### **1. Questions**
```typescript
interface Question {
  id: string              // Unique question ID (nanoid)
  createdBy: string       // User ID who created the question
  createdAt: number       // Unix timestamp
  questionText: string    // The actual question
  choices: {
    a: string
    b: string  
    c: string
    d: string
  }
  correctAnswer: 'a' | 'b' | 'c' | 'd'  // Which choice is correct
  totalAnswers: number    // Counter for total responses
  correctAnswers: number  // Counter for correct responses
}
```

### **2. User Answers**
```typescript
interface UserAnswer {
  id: string              // Unique answer ID (nanoid)
  questionId: string      // Reference to question
  userId: string          // User who answered
  selectedAnswer: 'a' | 'b' | 'c' | 'd'
  isCorrect: boolean      // Whether they got it right
  answeredAt: number      // Unix timestamp
  userName: string        // Cache user name for display
}
```

---

## **🔑 KV Storage Keys Structure**

### **Questions Storage**
```
question:{questionId}           → Question object
questions:recent               → Set of question IDs (last 24h)
questions:by-user:{userId}     → Set of question IDs by user
```

### **Answers Storage**  
```
answer:{answerId}              → UserAnswer object
answers:by-question:{questionId} → Set of answer IDs for question
answers:by-user:{userId}       → Set of answer IDs by user
user-answered:{userId}:{questionId} → Boolean (has user answered?)
```

### **Leaderboard/Stats**
```
question-stats:{questionId}    → Aggregated stats object
daily-questions:{YYYY-MM-DD}   → Set of question IDs for that day
```

---

## **⚡ Key Operations**

### **Create Question**
1. Generate unique question ID
2. Store question object at `question:{id}`
3. Add to `questions:recent` set with TTL (24h)
4. Add to `questions:by-user:{userId}` set

### **Get Recent Questions (Feed)**
1. Get question IDs from `questions:recent` set
2. Batch fetch question objects
3. Sort by `createdAt` (newest first)
4. Filter out questions user already answered

### **Submit Answer**
1. Check if user already answered via `user-answered:{userId}:{questionId}`
2. Create answer object at `answer:{id}`
3. Add to `answers:by-question:{questionId}` set
4. Set `user-answered:{userId}:{questionId}` = true
5. Update question counters (`totalAnswers`, `correctAnswers`)
6. Return immediate feedback + question stats

### **Get Question Stats**
1. Fetch all answers for question via `answers:by-question:{questionId}`
2. Aggregate correct/incorrect counts
3. Return anonymized user data for social features

---

## **🎯 Game Mechanics Implementation**

### **24-Hour Rolling Feed**
- Use Redis TTL on `questions:recent` entries
- Background cleanup job (optional)
- Client-side filtering for additional safety

### **Prevent Double Answering**
- Check `user-answered:{userId}:{questionId}` before allowing submission
- Return appropriate error if already answered

### **Real-time Stats**
- Update counters atomically when answers submitted
- Cache aggregated stats for performance

### **Social Features**
- Show "X people got this right, Y got it wrong"
- Show recent answerers (name only, for privacy)
- Optional: Show friends' answers (future enhancement)

---

## **📊 Performance Considerations**

### **Caching Strategy**
- Cache recent questions list (5min TTL)
- Cache question stats (1min TTL)  
- Use atomic operations for counters

### **Data Cleanup**
- Questions auto-expire from feed after 24h
- User answer history retained longer term
- Optional periodic cleanup of old data

### **Batch Operations**
- Fetch multiple questions in single KV call
- Batch update operations where possible

---

## **🔐 Security & Privacy**

### **Authorization**
- Only authenticated users can create/answer questions
- Users can only see their own detailed answer history
- Question stats are aggregated/anonymized

### **Validation** 
- Sanitize question text and choices
- Validate answer selections server-side
- Rate limiting on question creation

### **Data Privacy**
- Store minimal user data (ID, name only)
- Aggregate stats for social features
- No sensitive personal information

---

**Next Step**: Set up Vercel KV integration and create the API endpoints. 