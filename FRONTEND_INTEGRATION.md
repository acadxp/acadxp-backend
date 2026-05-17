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

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
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
```

---

## 2. Axios Client Setup

```typescript
// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1",
  withCredentials: true, // required for httpOnly cookie (refreshToken)
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token from Zustand store to every request
api.interceptors.request.use((config) => {
  // We'll read token from a module-level variable set by the store
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
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
        // redirect to login
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
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

// Module-level token store (bridge between Zustand and Axios)
let _accessToken: string | null = null;
export const getAccessToken = () => _accessToken;
export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

export default api;
```

---

## 3. API Service Layer

```typescript
// services/auth.service.ts
import api from "@/lib/axios";
import type { ApiResponse, AuthResponse, User } from "@/types";

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

  getEnrollments: () =>
    api.get<ApiResponse<StudentCourseEnrollment[]>>("/users/enrollments"),
};
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
} from "@/types";

export const courseService = {
  getAll: () =>
    api.get<ApiResponse<Course[]>>("/courses/all"),

  getById: (courseId: string) =>
    api.get<ApiResponse<Course>>(`/courses/${courseId}`),

  search: (params: { title?: string; courseCode?: string }) =>
    api.post<ApiResponse<{ found: boolean; courses: Course[] }>>("/courses/search", null, {
      params,
    }),

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
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.register(name, email, password);
          setAccessToken(data.data.accessToken);
          set({
            user: data.data.user,
            isAuthenticated: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.login(email, password);
          setAccessToken(data.data.accessToken);
          set({
            user: data.data.user,
            isAuthenticated: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // clear even if request fails
        }
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
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore access token on page load by trying refresh
        if (state?.isAuthenticated) {
          state.refreshSession();
        }
      },
    },
  ),
);
```

```typescript
// stores/profile.store.ts
import { create } from "zustand";
import { profileService } from "@/services/profile.service";
import type { Profile, StudentCourseEnrollment } from "@/types";

interface ProfileState {
  profile: Profile | null;
  enrollments: StudentCourseEnrollment[];
  isLoading: boolean;

  fetchProfile: () => Promise<void>;
  createProfile: (data: Parameters<typeof profileService.createProfile>[0]) => Promise<void>;
  fetchEnrollments: () => Promise<void>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  enrollments: [],
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

  fetchEnrollments: async () => {
    const { data } = await profileService.getEnrollments();
    set({ enrollments: data.data! });
  },

  reset: () => set({ profile: null, enrollments: [] }),
}));
```

```typescript
// stores/course.store.ts
import { create } from "zustand";
import { courseService } from "@/services/course.service";
import type { Course, StudentCourseEnrollment, GamificationData } from "@/types";

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
  generateBlueprint: (courseId: string, data: {
    courseTitle: string;
    courseDescription: string;
    academicLevel: string;
  }) => Promise<void>;
  confirmBlueprint: (courseId: string, payload: {
    selectedSkills: GeneratedSkill[];
    selectedChallenges: GeneratedChallenge[];
    selectedBadges?: GeneratedBadge[];
  }) => Promise<void>;
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
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCourseById: async (id) => {
    set({ isLoading: true, gamificationData: null });
    try {
      const { data } = await courseService.getById(id);
      set({ currentCourse: data.data! });
    } finally {
      set({ isLoading: false });
    }
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
    } finally {
      set({ isLoading: false });
    }
  },

  confirmBlueprint: async (courseId, payload) => {
    await courseService.confirmBlueprint(courseId, payload);
    set({ gamificationData: null });
    await get().fetchEnrollments();
  },

  reset: () => set({
    courses: [],
    currentCourse: null,
    enrollments: [],
    gamificationData: null,
  }),
}));
```

---

## 5. API Endpoints Reference

### Base URL: `http://localhost:8001/api/v1`

### Auth — `/auth`

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/register` | No | `{ name, email, password }` | `{ user, accessToken }` + sets `refreshToken` cookie |
| POST | `/login` | No | `{ email, password }` | `{ user, accessToken }` + sets `refreshToken` cookie |
| GET | `/check-email` | No | `?email=...` | `200` if available, `409` if taken |
| POST | `/refresh-token` | Cookie | _(empty body)_ | `{ user, accessToken }` + new `refreshToken` cookie |
| POST | `/logout` | Cookie | _(empty body)_ | Clears `refreshToken` cookie |

### Users / Profile — `/users`

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/profile` | Bearer | — | `{ profile }` |
| POST | `/profile/create` | Bearer | `{ username, bio?, location?, socials? }` | `{ profile }` |
| GET | `/profile/check-username` | No | `?username=...` | `200` if available, `409` if taken |
| GET | `/enrollments` | Bearer | — | `CourseEnrollment[]` |

### Academic Info — `/academic-infos`

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/me` | Bearer | `?profileId=...` | `{ academicInfo }` |
| POST | `/create` | No | `{ profileId, institution?, degree?, major?, semester?, enrollmentStatus, graduationDate?, enrolledDate? }` | `{ academicInfo }` |

### Courses — `/courses`

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/create` | No | `{ courseCode, title, description?, xp, department }` | `Course` |
| POST | `/search` | No | `?title=&courseCode=` | `{ found, courses[] }` |
| GET | `/all` | No | — | `Course[]` |
| GET | `/:courseId` | No | — | `Course` |
| DELETE | `/:courseId` | No | — | — |
| POST | `/:courseId/enroll` | Bearer | — | `CourseEnrollment` |
| DELETE | `/:courseId/enroll` | Bearer | — | — |
| POST | `/:courseId/blueprint` | Bearer | `{ courseTitle, courseDescription, academicLevel }` | `GamificationData` (skills, challenges, badges) |
| POST | `/blueprint/confirm` | Bearer | `{ courseId, confirmPayload: { selectedSkills[], selectedChallenges[], selectedBadges?[] } }` | — |

---

## 6. Auth Flow Diagram

```
REGISTER / LOGIN
  │
  ├─ POST /auth/register  (or /login)
  │
  ├─ Response:
  │   ├─ body: { user, accessToken }
  │   └─ cookie: refreshToken (httpOnly, secure, sameSite=none, 7d)
  │
  ├─ Store accessToken in Zustand + Axios module variable
  │
  ├─ All subsequent API calls include:
  │   └─ Authorization: Bearer <accessToken>
  │
  ├─ When accessToken expires (401):
  │   ├─ Axios interceptor catches 401
  │   ├─ POST /auth/refresh-token (cookie sent automatically)
  │   ├─ Receives new accessToken + new refreshToken cookie
  │   └─ Retries the failed request
  │
  └─ LOGOUT:
      └─ POST /auth/logout → clears cookie + nullifies token
```

### Cookie Configuration (backend sends):
```
Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=None; Max-Age=604800
```

**Important for Next.js:**
- Use `withCredentials: true` in Axios
- Dev: ensure `SameSite=None; Secure` works (requires HTTPS in production)
- If testing locally without HTTPS, ask backend to set `secure: false` in dev

---

## 7. Key Integration Notes

1. **User Onboarding Flow:**
   - Register → creates User + Account (with refreshToken)
   - Create Profile → `POST /users/profile/create` (username, bio, etc.)
   - Create Academic Info → `POST /academic-infos/create` (requires `profileId`)
   - Enroll in Courses → `POST /courses/:courseId/enroll`

2. **AI Blueprint Flow:**
   - `POST /courses/:courseId/blueprint` sends course details to Mistral AI
   - Returns `{ skills[], challenges[], badges[] }` with criteria/rules
   - Present these as selectable options to the user
   - User selects desired ones → `POST /courses/blueprint/confirm`
   - Backend creates all selected skills, challenges, badges, enrolls user

3. **Error Handling:**
   - All errors: `{ success: false, message: string, errors?: string[] }`
   - Validation error `400`: Zod error details in `errors` array
   - Auth error `401`: Token missing/expired
   - Not found `404`: Resource not found
   - Conflict `409`: Duplicate email/username

4. **CORS:** Backend expects requests from `http://localhost:3000` (dev). Configure your frontend URL accordingly.

5. **CSRF:** Not implemented. Since refresh token is httpOnly, CSRF risk is limited. If needed, add CSRF tokens later.
