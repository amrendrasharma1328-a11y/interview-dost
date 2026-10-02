-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Candidate',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'live',
    "interviewType" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "totalQuestions" INTEGER NOT NULL,
    "candidateJson" TEXT NOT NULL,
    "jobJson" TEXT NOT NULL,
    "planJson" TEXT NOT NULL,
    "stateJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "reportJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "InterviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "answer" TEXT,
    "askedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterviewQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnswerEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "technicalAccuracy" INTEGER NOT NULL,
    "clarity" INTEGER NOT NULL,
    "specificity" INTEGER NOT NULL,
    "completeness" INTEGER NOT NULL,
    "weakAreas" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "nextAction" TEXT NOT NULL,
    CONSTRAINT "AnswerEvaluation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PracticeDrill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "weakArea" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    CONSTRAINT "PracticeDrill_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AnswerEvaluation_questionId_key" ON "AnswerEvaluation"("questionId");
