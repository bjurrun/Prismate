-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "microsoftId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "microsoftId" TEXT,
    "displayName" TEXT NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "clerkUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "microsoftId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "status" TEXT NOT NULL DEFAULT 'notStarted',
    "importance" TEXT NOT NULL DEFAULT 'normal',
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "isReminderOn" BOOLEAN NOT NULL DEFAULT false,
    "createdDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedDateTime" TIMESTAMP(3) NOT NULL,
    "startDateTime" TIMESTAMP(3),
    "dueDateTime" TIMESTAMP(3),
    "completedDateTime" TIMESTAMP(3),
    "reminderDateTime" TIMESTAMP(3),
    "recurrence" JSONB,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isMyDay" BOOLEAN NOT NULL DEFAULT false,
    "myDayDate" TIMESTAMP(3),
    "bodyLastModifiedDateTime" TIMESTAMP(3),
    "isFromEmail" BOOLEAN NOT NULL DEFAULT false,
    "webLink" TEXT,
    "fromEmail" TEXT,
    "clerkUserId" TEXT NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "microsoftId" TEXT,
    "displayName" TEXT NOT NULL,
    "givenName" TEXT,
    "surname" TEXT,
    "jobTitle" TEXT,
    "companyName" TEXT,
    "email" TEXT,
    "mobilePhone" TEXT,
    "businessPhone" TEXT,
    "notes" TEXT,
    "clerkUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_microsoftId_key" ON "User"("microsoftId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_microsoftId_key" ON "Project"("microsoftId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_clerkUserId_microsoftId_key" ON "Project"("clerkUserId", "microsoftId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_microsoftId_key" ON "Task"("microsoftId");

-- CreateIndex
CREATE INDEX "Task_clerkUserId_isImportant_isMyDay_idx" ON "Task"("clerkUserId", "isImportant", "isMyDay");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_microsoftId_key" ON "Contact"("microsoftId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clerkUserId_fkey" FOREIGN KEY ("clerkUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_clerkUserId_fkey" FOREIGN KEY ("clerkUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clerkUserId_fkey" FOREIGN KEY ("clerkUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
