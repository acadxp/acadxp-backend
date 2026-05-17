# AcadXP Frontend Integration Guide

## Stack
- **Next.js** (App Router)
- **Axios** (HTTP client)
- **Zustand** (state management)

---

## 1. TypeScript Types

```typescript
// === ENUMS ===
export type Role = "STUDENT" | "TEACHER" | "ADMIN";
export type Department = "SCIENCE" | "ARTS" | "COMMERCE" | "ENGINEERING" | "MEDICINE" | "LAW" | "EDUCATION" | "TECHNOLOGY" | "OTHER";
export type DegreeType = "BACHELORS" | "MASTERS" | "PHD" | "DIPLOMA" | "CERTIFICATE";
export type EnrollmentStatus = "FULL_TIME" | "PART_TIME" | "SUSPENDED" | "GRADUATED";
export type CourseStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DRAFT";
export type ChallengeDifficulty = "easy" | "medium" | "hard";
export type ChallengeType = "DAILY" | "WEEKLY" | "MONTHLY" | "ASSIGNMENT" | "QUIZ" | "PROJECT" | "ACHIEVEMENT";
export type NotificationType = "STREAK" | "DEADLINE" | "GOAL" | "LEVEL_UP" | "BADGE";
export type GoalType = "XP" | "SKILL" | "CHALLENGE" | "COURSE" | "STREAK";

// === AUTH ===
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserWithoutPassword = Omit<User, "password">;

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: UserWithoutPassword;
    accessToken: string;
  };
}

// === PROFILE ===
export interface Profile {
  id: string;
  userId: string;
  username: string;
  bio?: string;
  location?: string;
  socials?: Record<string, string>;
  academicInfo?: AcademicInfo;
  createdAt: string;
  updatedAt: string;
}

// === ACADEMIC INFO ===
export interface AcademicInfo {
  id: string;
  profileId: string;
  xp: number;
  level: number;
  streak: number;
  institution?: string;
  degree?: DegreeType;
  major?: string;
  semester?: string;
  enrollmentStatus: EnrollmentStatus;
  graduationDate?: string;
  enrolledDate?: string;
  courses?: StudentCourseEnrollment[];
  studentSkills?: StudentSkill[];
  studentChallenges?: StudentChallenge[];
  badges?: StudentBadge[];
  notifications?: Notification[];
  goals?: Goal[];
}

// === COURSES ===
export interface Course {
  id: string;
  courseCode: string;
  title: string;
  description?: string;
  xp: number;
  department: Department;
  status: CourseStatus;
  skills?: CourseSkill[];
  challenges?: CourseChallenge[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentCourseEnrollment {
  id: string;
  academicInfoId: string;
  courseId: string;
  course: Course;
  enrollmentDate: string;
  completedAt?: string;
  completedStatus: boolean;
  xpEarned: number;
}

// === SKILLS ===
export interface Skill {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  xpValue: number;
}

export interface CourseSkill {
  courseId: string;
  skillId: string;
  skill: Skill;
  proficiencyLevel: ProficiencyLevel;
}

export interface StudentSkill {
  academicInfoId: string;
  skillId: string;
  skill: Skill;
  proficiencyLevel: ProficiencyLevel;
  xpEarned: number;
  acquiredAt: string;
  masteredAt?: string;
}

// === CHALLENGES ===
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  xpReward: number;
  criteria: Criteria;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface CourseChallenge {
  courseId: string;
  challengeId: string;
  challenge: Challenge;
  isRequired: boolean;
  order: number;
}

export interface StudentChallenge {
  academicInfoId: string;
  challengeId: string;
  challenge: Challenge;
  attempts: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "ABANDONED";
  progress: number;
  result?: any;
  completedAt?: string;
}

// === BADGES ===
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon?: string;
  xpReward: number;
  criteria: Criteria;
}

export interface StudentBadge {
  academicInfoId: string;
  badgeId: string;
  badge: Badge;
  unlockedAt: string;
}

// === NOTIFICATIONS & GOALS ===
export interface Notification {
  id: string;
  academicInfoId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  sentAt: string;
}

export interface Goal {
  id: string;
  academicInfoId: string;
  type: GoalType;
  target: any;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

// === BLUEPRINT (AI Gamification) ===
export interface Rule {
  type: "COMPLETION" | "SCORE" | "SUBMISSION" | "GRADE" | "COUNT";
  target: string;
  operator: "EQ" | "GTE" | "LTE" | "GT" | "LT";
  value: number;
}

export interface Criteria {
  logic: "AND" | "OR";
  rules: Rule[];
}

export interface GeneratedSkill {
  title: string;
  description: string;
  xpValue: number;
  iconPrompt: string | null;
  criteria: Criteria;
}

export interface GeneratedChallenge {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  criteria: Criteria;
}

export interface GeneratedBadge {
  title: string;
  description: string;
  xpValue: number;
  iconPrompt: string | null;
  criteria: Criteria;
}

export interface GamificationData {
  skills: GeneratedSkill[];
  challenges: GeneratedChallenge[];
  badges: GeneratedBadge[];
}

// === GENERIC API RESPONSE ===
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// === WORKFLOW ===
export type CourseCreationWorkflow =
  | "IDLE"
  | "SEARCHING"
  | "DUPLICATE_FOUND"
  | "CREATING"
  | "GENERATING_BLUEPRINT"
  | "REVIEWING_BLUEPRINT"
  | "CONFIRMING"
  | "SUCCESS";
```

---

## 2. Axios Client Setup

```typescript
// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
}

let _accessToken: string | null = null;
export const getAccessToken = () => _accessToken;
export const setAccessToken = (token: string | null) => { _accessToken = token; };

export default api;
```

---

## 3. API Service Layer

```typescript
// services/auth.service.ts
import api from "@/lib/axios";
import type { ApiResponse, AuthResponse } from "@/types";

export const authService = {
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>("/auth/register", { name, email, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),

  logout: () => api.post<ApiResponse>("/auth/logout"),

  refreshToken: () =>
    api.post<AuthResponse>("/auth/refresh-token", {}, { withCredentials: true }),

  checkEmail: (email: string) =>
    api.get<ApiResponse>("/auth/check-email", { params: { email } }),
};
```

```typescript
// services/profile.service.ts
import api from "@/lib/axios";
import type { ApiResponse, Profile } from "@/types";

export const profileService = {
  getProfile: () =>
    api.get<ApiResponse<{ profile: Profile }>>("/users/profile"),

  createProfile: (data: {
    username: string;
    bio?: string;
    location?: string;
    socials?: Record<string, string>;
  }) => api.post<ApiResponse<{ profile: Profile }>>("/users/profile/create", data),

  checkUsername: (username: string) =>
    api.get<ApiResponse>("/users/profile/check-username", {
      params: { username },
    }),
};
// Enrollments are fetched via GET /courses/enrollments (see course service)
```

```typescript
// services/academic-info.service.ts
import api from "@/lib/axios";
import type { ApiResponse, AcademicInfo } from "@/types";

export const academicInfoService = {
  getMyInfo: (profileId: string) =>
    api.get<ApiResponse<{ academicInfo: AcademicInfo }>>("/academic-infos/me", {
      params: { profileId },
    }),

  create: (data: {
    profileId: string;
    institution?: string;
    degree?: string;
    major?: string;
    semester?: string;
    enrollmentStatus: string;
    graduationDate?: string;
    enrolledDate?: string;
  }) => api.post<ApiResponse<{ academicInfo: AcademicInfo }>>("/academic-infos/create", data),
};
```

```typescript
// services/course.service.ts
import api from "@/lib/axios";
import type {
  ApiResponse,
  Course,
  StudentCourseEnrollment,
  GamificationData,
  GeneratedSkill,
  GeneratedChallenge,
  GeneratedBadge,
} from "@/types";

export const courseService = {
  getAll: () => api.get<ApiResponse<Course[]>>("/courses/all"),

  getById: (courseId: string) =>
    api.get<ApiResponse<Course>>(`/courses/${courseId}`),

  search: (params: { title?: string; courseCode?: string }) =>
    api.post<ApiResponse<{ found: boolean; courses: Course[] }>>("/courses/search", null, { params }),

  create: (data: {
    courseCode: string;
    title: string;
    description?: string;
    xp: number;
    department: string;
  }) => api.post<ApiResponse<Course>>("/courses/create", data),

  delete: (courseId: string) =>
    api.delete<ApiResponse>(`/courses/${courseId}`),

  enroll: (courseId: string) =>
    api.post<ApiResponse<StudentCourseEnrollment>>(`/courses/${courseId}/enroll`),

  unenroll: (courseId: string) =>
    api.delete<ApiResponse>(`/courses/${courseId}/enroll`),

  getEnrollments: () =>
    api.get<ApiResponse<StudentCourseEnrollment[]>>("/courses/enrollments"),

  // --- AI Blueprint ---
  generateBlueprint: (courseId: string, data: {
    courseTitle: string;
    courseDescription: string;
    academicLevel: string;
  }) => api.post<ApiResponse<GamificationData>>(`/courses/${courseId}/blueprint`, data),

  confirmBlueprint: (courseId: string, confirmPayload: {
    selectedSkills: GeneratedSkill[];
    selectedChallenges: GeneratedChallenge[];
    selectedBadges?: GeneratedBadge[];
  }) => api.post<ApiResponse>("/courses/blueprint/confirm", { courseId, confirmPayload }),
};
```

---

## 4. Zustand Stores

```typescript
// stores/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";
import { setAccessToken } from "@/lib/axios";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.register(name, email, password);
          setAccessToken(data.data.accessToken);
          set({ user: data.data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.login(email, password);
          setAccessToken(data.data.accessToken);
          set({ user: data.data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try { await authService.logout(); } catch { /* clear anyway */ }
        setAccessToken(null);
        set({ user: null, isAuthenticated: false });
      },

      refreshSession: async () => {
        try {
          const { data } = await authService.refreshToken();
          setAccessToken(data.data.accessToken);
          set({ user: data.data.user, isAuthenticated: true });
        } catch {
          setAccessToken(null);
          set({ user: null, isAuthenticated: false });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) state.refreshSession();
      },
    },
  ),
);
```

```typescript
// stores/profile.store.ts
import { create } from "zustand";
import { profileService } from "@/services/profile.service";
import type { Profile } from "@/types";

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;

  fetchProfile: () => Promise<void>;
  createProfile: (data: Parameters<typeof profileService.createProfile>[0]) => Promise<void>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const { data } = await profileService.getProfile();
      set({ profile: data.data!.profile });
    } finally {
      set({ isLoading: false });
    }
  },

  createProfile: async (profileData) => {
    const { data } = await profileService.createProfile(profileData);
    set({ profile: data.data!.profile });
  },

  reset: () => set({ profile: null }),
}));
```

```typescript
// stores/course.store.ts
import { create } from "zustand";
import { courseService } from "@/services/course.service";
import type {
  Course,
  StudentCourseEnrollment,
  GamificationData,
  GeneratedSkill,
  GeneratedChallenge,
  GeneratedBadge,
} from "@/types";

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  enrollments: StudentCourseEnrollment[];
  gamificationData: GamificationData | null;
  isLoading: boolean;

  fetchCourses: () => Promise<void>;
  fetchCourseById: (id: string) => Promise<void>;
  searchCourses: (params: { title?: string; courseCode?: string }) => Promise<Course[]>;
  enroll: (courseId: string) => Promise<void>;
  unenroll: (courseId: string) => Promise<void>;
  fetchEnrollments: () => Promise<void>;
  generateBlueprint: (courseId: string, data: { courseTitle: string; courseDescription: string; academicLevel: string }) => Promise<void>;
  confirmBlueprint: (courseId: string, payload: { selectedSkills: GeneratedSkill[]; selectedChallenges: GeneratedChallenge[]; selectedBadges?: GeneratedBadge[] }) => Promise<void>;
  reset: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  currentCourse: null,
  enrollments: [],
  gamificationData: null,
  isLoading: false,

  fetchCourses: async () => {
    set({ isLoading: true });
    try {
      const { data } = await courseService.getAll();
      set({ courses: data.data! });
    } finally { set({ isLoading: false }); }
  },

  fetchCourseById: async (id) => {
    set({ isLoading: true, gamificationData: null });
    try {
      const { data } = await courseService.getById(id);
      set({ currentCourse: data.data! });
    } finally { set({ isLoading: false }); }
  },

  searchCourses: async (params) => {
    const { data } = await courseService.search(params);
    return data.data!.courses;
  },

  enroll: async (courseId) => {
    await courseService.enroll(courseId);
    await get().fetchEnrollments();
  },

  unenroll: async (courseId) => {
    await courseService.unenroll(courseId);
    await get().fetchEnrollments();
  },

  fetchEnrollments: async () => {
    const { data } = await courseService.getEnrollments();
    set({ enrollments: data.data! });
  },

  generateBlueprint: async (courseId, payload) => {
    set({ isLoading: true });
    try {
      const { data } = await courseService.generateBlueprint(courseId, payload);
      set({ gamificationData: data.data! });
    } finally { set({ isLoading: false }); }
  },

  confirmBlueprint: async (courseId, payload) => {
    await courseService.confirmBlueprint(courseId, payload);
    set({ gamificationData: null });
    await get().fetchEnrollments();
  },

  reset: () => set({
    courses: [], currentCourse: null, enrollments: [], gamificationData: null,
  }),
}));
```

---

## 5. Course Creation Workflow Store

This is the **state machine** that orchestrates the entire course creation + enrollment + AI blueprint flow.

```typescript
// stores/course-creation.store.ts
import { create } from "zustand";
import { courseService } from "@/services/course.service";
import type {
  Course,
  CourseCreationWorkflow,
  GamificationData,
  GeneratedSkill,
  GeneratedChallenge,
  GeneratedBadge,
} from "@/types";

interface CourseCreationState {
  workflow: CourseCreationWorkflow;
  similarCourses: Course[];
  createdCourse: Course | null;
  gamificationData: GamificationData | null;
  error: string | null;

  startFlow: (formData: {
    courseCode: string;
    title: string;
    description?: string;
    xp: number;
    department: string;
    academicLevel: string;
  }) => Promise<void>;

  confirmBlueprint: (payload: {
    selectedSkills: GeneratedSkill[];
    selectedChallenges: GeneratedChallenge[];
    selectedBadges?: GeneratedBadge[];
  }) => Promise<void>;

  enrollExisting: (courseId: string) => Promise<void>;
  reset: () => void;
}

export const useCourseCreationStore = create<CourseCreationState>((set, get) => ({
  workflow: "IDLE",
  similarCourses: [],
  createdCourse: null,
  gamificationData: null,
  error: null,

  startFlow: async (formData) => {
    const { courseCode, title, description, xp, department, academicLevel } = formData;
    set({ error: null });

    // ── Step 1: Search for duplicates ──────────────────────────────────
    set({ workflow: "SEARCHING" });
    try {
      const searchResult = await courseService.search({ title, courseCode });
      const similar = searchResult.data.data?.courses ?? [];

      if (similar.length > 0) {
        set({ similarCourses: similar, workflow: "DUPLICATE_FOUND" });
        return;
      }
    } catch (e: any) {
      set({ error: "Could not search courses", workflow: "IDLE" });
      return;
    }

    // ── Step 2: Create the course ──────────────────────────────────────
    set({ workflow: "CREATING" });
    let course: Course;
    try {
      const { data } = await courseService.create({ courseCode, title, description, xp, department });
      course = data.data!;
      set({ createdCourse: course });
    } catch (e: any) {
      set({ error: "Failed to create course", workflow: "IDLE" });
      return;
    }

    // ── Step 3: Generate AI Blueprint ──────────────────────────────────
    set({ workflow: "GENERATING_BLUEPRINT" });
    try {
      const { data } = await courseService.generateBlueprint(course.id, {
        courseTitle: title,
        courseDescription: description ?? "",
        academicLevel,
      });
      set({ gamificationData: data.data!, workflow: "REVIEWING_BLUEPRINT" });
    } catch (e: any) {
      set({ error: "Blueprint generation failed. Retry?", workflow: "IDLE" });
    }
  },

  confirmBlueprint: async (payload) => {
    const course = get().createdCourse;
    if (!course) return;

    set({ workflow: "CONFIRMING", error: null });
    try {
      await courseService.confirmBlueprint(course.id, payload);
      set({ workflow: "SUCCESS", gamificationData: null });
    } catch (e: any) {
      set({ error: "Failed to confirm blueprint", workflow: "REVIEWING_BLUEPRINT" });
    }
  },

  enrollExisting: async (courseId) => {
    set({ workflow: "CONFIRMING", error: null });
    try {
      await courseService.enroll(courseId);
      set({ workflow: "SUCCESS" });
    } catch (e: any) {
      set({ error: "Could not enroll in course", workflow: "DUPLICATE_FOUND" });
    }
  },

  reset: () => set({
    workflow: "IDLE",
    similarCourses: [],
    createdCourse: null,
    gamificationData: null,
    error: null,
  }),
}));
```

---

## 6. Course Creation UI Components

### CourseCreationForm
Main form: `courseCode`, `title`, `description?`, `xp`, `department`, `academicLevel`.

```tsx
// app/courses/create/page.tsx
"use client";
import { useCourseCreationStore } from "@/stores/course-creation.store";

export default function CreateCoursePage() {
  const { workflow, error, startFlow, reset } = useCourseCreationStore();

  const handleSubmit = (formData: FormData) => {
    startFlow({
      courseCode: formData.get("courseCode") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      xp: Number(formData.get("xp")),
      department: formData.get("department") as string,
      academicLevel: formData.get("academicLevel") as string,
    });
  };

  if (workflow === "DUPLICATE_FOUND") return <SimilarCoursesModal />;
  if (workflow === "REVIEWING_BLUEPRINT") return <BlueprintReview />;
  if (workflow === "SUCCESS") return <SuccessView />;

  return (
    <form onSubmit={/* ... */}>
      {/* stepper + fields */}
      <CourseCreationStepper step={workflow} />
      {/* ... */}
    </form>
  );
}
```

### SimilarCoursesModal
Shows duplicate courses found — user picks one to enroll directly.

### BlueprintReview
Renders `gamificationData.skills`, `.challenges`, `.badges` as selectable cards.
User picks desired items then clicks "Confirm":

```tsx
const handleConfirm = () => {
  confirmBlueprint({
    selectedSkills: selectedItems,
    selectedChallenges: selectedItems,
    selectedBadges: selectedItems,
  });
};
```

### CourseCreationStepper
```tsx
const steps = [
  { key: "SEARCHING", label: "Search" },
  { key: "CREATING", label: "Create" },
  { key: "GENERATING_BLUEPRINT", label: "Generate AI" },
  { key: "REVIEWING_BLUEPRINT", label: "Review" },
  { key: "CONFIRMING", label: "Confirm" },
  { key: "SUCCESS", label: "Complete" },
];
```

---

## 7. API Endpoints Reference

### Base URL: `http://localhost:8001/api/v1`

### Health

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/api/health` | No | `{ status: "OK", message: "Server is healthy" }` |

### Auth — `/auth`

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/register` | No | `{ name, email, password }` | `{ user: UserWithoutPassword, accessToken }` + `refreshToken` cookie |
| POST | `/login` | No | `{ email, password }` | `{ user: UserWithoutPassword, accessToken }` + `refreshToken` cookie |
| GET | `/check-email` | No | `?email=...` | `200` if available, `409` if taken |
| POST | `/refresh-token` | Cookie | _(empty)_ | `{ user: UserWithoutPassword, accessToken }` + new `refreshToken` cookie |
| POST | `/logout` | Cookie | _(empty)_ | Clears `refreshToken` cookie |

### Users / Profile — `/users`

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/profile` | Bearer | — | `{ profile: Profile }` |
| POST | `/profile/create` | Bearer | `{ username, bio?, location?, socials? }` | `{ profile: Profile }` |
| GET | `/profile/check-username` | No | `?username=...` | `200` if available, `409` if taken |

### Academic Info — `/academic-infos`

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/me` | Bearer | `?profileId=...` | `{ academicInfo: AcademicInfo }` |
| POST | `/create` | No | `{ profileId, institution?, degree?, major?, semester?, enrollmentStatus, graduationDate?, enrolledDate? }` | `{ academicInfo: AcademicInfo }` |

### Courses — `/courses`

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/create` | No | `{ courseCode, title, description?, xp, department }` | `Course` |
| POST | `/search` | No | `?title=&courseCode=` | `{ found: bool, courses: Course[] }` |
| GET | `/all` | No | — | `Course[]` |
| GET | `/:courseId` | No | — | `Course` |
| DELETE | `/:courseId` | No | — | — |
| POST | `/:courseId/enroll` | Bearer | — | `StudentCourseEnrollment` |
| DELETE | `/:courseId/enroll` | Bearer | — | — |
| GET | `/enrollments` | Bearer | — | `StudentCourseEnrollment[]` |
| POST | `/:courseId/blueprint` | Bearer | `{ courseTitle, courseDescription, academicLevel }` | `GamificationData` |
| POST | `/blueprint/confirm` | Bearer | `{ courseId, confirmPayload: { selectedSkills[], selectedChallenges[], selectedBadges?[] } }` | — |

---

## 8. Auth Flow

```
REGISTER / LOGIN
  │
  ├─ Response:
  │   ├─ body: { user, accessToken }
  │   └─ cookie: refreshToken (httpOnly, secure, sameSite=none, 7d)
  │
  ├─ Store accessToken in Zustand + Axios
  ├─ All API calls: Authorization: Bearer <accessToken>
  │
  ├─ On 401:
  │   ├─ Axios interceptor catches
  │   ├─ POST /auth/refresh-token (cookie sent automatically)
  │   ├─ New accessToken + new refreshToken cookie
  │   └─ Retries failed request
  │
  └─ LOGOUT: POST /auth/logout → clears cookie + nullifies token
```

### Cookie:
```
Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=None; Max-Age=604800
```

---

## 9. Course Creation Flow (State Machine)

```
IDLE
  ↓
SEARCHING (POST /courses/search)
  ↓
DUPLICATE_FOUND?
  ├── YES → enrollExisting() → POST /courses/:id/enroll → SUCCESS
  └── NO
        ↓
    CREATING (POST /courses/create)
        ↓
    GENERATING_BLUEPRINT (POST /courses/:id/blueprint)
        ↓
    REVIEWING_BLUEPRINT (user selects skills/challenges/badges)
        ↓
    CONFIRMING (POST /courses/blueprint/confirm)
        ↓
    SUCCESS
```

### Full sequence:
1. User submits form `{ courseCode, title, description, xp, department, academicLevel }`
2. `POST /courses/search?title=&courseCode=` — check for duplicates
3. **If duplicates found:** show list → user picks one → `POST /courses/:id/enroll` → done
4. **If no duplicates:** `POST /courses/create` → get `course.id`
5. `POST /courses/:id/blueprint` — AI generates `{ skills[], challenges[], badges[] }`
6. User reviews & selects desired items → `POST /courses/blueprint/confirm`
7. Backend creates all + auto-enrolls → done

---

## 10. Key Integration Notes

1. **User Onboarding Flow:**
   - Register → `POST /auth/register`
   - Create Profile → `POST /users/profile/create` (requires auth)
   - Create Academic Info → `POST /academic-infos/create` (requires `profileId`)
   - Then can enroll in courses

2. **AI Blueprint Flow:**
   - `POST /courses/:courseId/blueprint` → sends to Mistral AI → returns gamification data
   - User can deselect any generated items
   - `POST /courses/blueprint/confirm` → backend creates skills/challenges/badges + enrolls user
   - Returns `200` on success; blueprint status becomes `ACCEPTED` or `PARTIALLY_ACCEPTED`

3. **Error Handling:**
   - All errors: `{ success: false, message, errors?: string[] }`
   - `400`: Zod validation errors
   - `401`: Missing/expired token
   - `404`: Resource not found (course, profile, academic info)
   - `409`: Duplicate email/username
   - `500`: Server errors (incl. AI generation failure)

4. **CORS:** Backend expects `http://localhost:3000` (dev). Configure via `FRONTEND_URL` env.

5. **HTTP-only cookies** are used for refresh tokens — `withCredentials: true` must be set.
