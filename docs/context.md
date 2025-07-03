# 102 Vibe-Coding Class: Context & Progress Tracker

## 🎯 Course Overview

### **Goal**
Teach working professionals, PMs, and executives the principles of building a "real website" through hands-on coding of a quiz application that demonstrates the three core building blocks: **Auth**, **Storage**, and **Hosting**.

### **Target Audience**
- Working professionals
- Product Managers  
- Executives
- Anyone who completed the 101 Class (meal-planner with LLM integration)

### **Time Constraint**
⏰ **2.5 hours total** - fast-paced, achievement-focused learning

### **Mobile-First Philosophy**
🚀 **Optimized for modern mobile web browsing** to maximize sharing and engagement propensity

---

## 🛠 Tech Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Framework** | Next.js | Complementary with other choices, full-stack |
| **Authentication** | Auth.js | Easy integration, Google OAuth |
| **Storage** | Vercel KV | Simple, fast setup |
| **Hosting** | Vercel | Seamless deployment, auto-deploy from GitHub |
| **Styling** | Tailwind CSS | Mobile-first, rapid development |

---

## 🎮 Application Theme: Interactive Quiz Platform

### **Core Concept**
Users can:
- ✅ Login with Google
- ✅ Create quiz questions with 4 multiple-choice options
- ✅ Answer questions from other users
- ✅ See real-time feedback (correct/incorrect)
- ✅ View who got questions right/wrong
- ✅ Share their live quiz with friends and family

### **Why This Theme?**
- **Immediately functional** and shareable
- **Social engagement** built-in
- **Clear value proposition** for users
- **Motivation to host and share** with personal networks

---

## 📚 Module Structure & Progress

### **Module 0: Foundation Setup** 
**Time Allocation:** 15-20 minutes  
**Status:** ✅ **COMPLETE**

#### **Objectives:**
- [x] Demo existing Next.js boilerplate (`pnpm dev`)
- [x] Explain fundamental concepts: Git, GitHub, code collaboration
- [x] Code tour: folder structure (`src/app/`, `public/`, configs)
- [ ] First Git commit and push (sets up deployment pipeline) *[Skipped per user request]*

#### **Key Learning:**
- "This single command creates a full website" ✅
- Understanding the development → production pipeline ✅
- App Router structure and file organization ✅

#### **Success Metric:**
✅ Everyone has the app running locally and understands the codebase structure

---

### **Module 1: Authentication Magic**
**Time Allocation:** 30-35 minutes  
**Status:** ⭕ Not Started

#### **Objectives:**
- [ ] Integrate Google OAuth via Auth.js
- [ ] Display user info on successful login (name, avatar)
- [ ] Create two-state UI: Login button ↔ Welcome message + Logout
- [ ] Console log accessed Google information for "aha moment"
- [ ] Prettify the login page with mobile-first design

#### **Key Learning:**
- "You just connected to Google's 2 billion user database!"
- Authentication as a service concept

#### **Success Metric:**
Everyone can login with Google and see their profile information

---

### **Module 2: Game Mechanics & Storage**
**Time Allocation:** 45-50 minutes  
**Status:** ⭕ Not Started

#### **Objectives:**
- [ ] Design data models: Users, Questions, Answers, Metadata
- [ ] Create CRUD APIs:
  - `POST /api/quiz` - Create question
  - `GET /api/quiz` - Get all questions
  - `POST /api/quiz/[id]/answer` - Submit answer
- [ ] Implement quiz logic: scoring, right/wrong tracking
- [ ] Test APIs with simple requests
- [ ] Feed display: Most recent → oldest questions

#### **Data Structure:**
```typescript
// Question Model
{
  id: string
  question: string
  options: string[4]
  correctAnswer: number (0-3)
  creatorId: string
  createdAt: Date
}

// Answer Model  
{
  questionId: string
  userId: string
  selectedAnswer: number
  isCorrect: boolean
  answeredAt: Date
}
```

#### **Success Metric:**
Everyone can create questions and submit answers via API

---

### **Module 3: UI/UX & Polish**
**Time Allocation:** 35-40 minutes  
**Status:** ⭕ Not Started

#### **Objectives:**
- [ ] Build mobile-first question creation form
- [ ] Design beautiful question cards for answering
- [ ] Implement real-time feedback UI
- [ ] Create question feed with infinite scroll feeling
- [ ] Add loading states and micro-interactions
- [ ] Final Git commit and push to main/master

#### **Mobile-First Considerations:**
- Touch-friendly buttons (min 44px)
- Readable typography on small screens
- Thumb-friendly navigation
- Fast loading and responsive design

#### **Success Metric:**
Everyone has a polished, mobile-optimized quiz interface

---

### **Module 4: Deploy & Share**
**Time Allocation:** 15-20 minutes  
**Status:** ⭕ Not Started

#### **Objectives:**
- [ ] Connect GitHub repo to Vercel
- [ ] Deploy live application
- [ ] Test live URLs together
- [ ] Students answer each other's questions in real-time
- [ ] Share links with friends/family immediately

#### **Celebration Moment:**
"Send this link to friends/family right now!"

#### **Success Metric:**
Everyone has a live, shareable quiz application URL

---

## 🚨 Risk Mitigation Strategy

### **Technical Safeguards:**
- [ ] Checkpoint commits after each module
- [ ] Pre-built fallback branches available
- [ ] Copy-paste snippets for complex configurations
- [ ] Instructor backup deployment ready

### **Time Management:**
- [ ] Hard stops at each module timeframe
- [ ] "Skip ahead" options for students who get stuck
- [ ] Pair programming system for peer support

### **Engagement Maintenance:**
- [ ] Celebrate small wins at each module completion
- [ ] Live preview of progress throughout
- [ ] Interactive problem-solving as a group

---

## 📊 Success Criteria

### **Technical Achievement:**
- ✅ Functional authentication system
- ✅ Working quiz creation and answering
- ✅ Live, deployed application
- ✅ Mobile-optimized user experience

### **Educational Value:**
- ✅ Understanding of auth, storage, and hosting concepts
- ✅ Confidence in full-stack development
- ✅ Git workflow comprehension
- ✅ Deployment pipeline knowledge

### **Engagement Goals:**
- ✅ Students actively share their quiz with personal networks
- ✅ Immediate post-class usage and content creation
- ✅ Motivation to continue building web applications

---

## 🔄 Progress Updates

*This section will be updated after each module completion*

### **Latest Update:** Module 0 Complete! 🎉
**Date:** Foundation Setup  
**Completed:** 
- ✅ Next.js project successfully building and running
- ✅ Development server active on port 3000
- ✅ Code tour completed - students understand project structure
- ✅ Mobile-first foundation ready (Tailwind CSS v4, TypeScript)

**Next Step:** Begin Module 1 - Authentication Magic with Auth.js and Google OAuth

---

*Last Updated: [Current Date] | Course Duration: 2.5 hours | Target: Mobile-First Quiz Platform* 