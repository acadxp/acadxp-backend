import { CourseRepo } from "../infra/repos/course.repo";
import type { CreateCourseInput } from "../validation/course.schema";
import { HttpError } from "../error/httpError";

const createCourse = async (data: CreateCourseInput) => {
  const { courseCode, title, department } = data;

  // Check for existing course
  const existingCheck = await findExistingCourse(courseCode, title, department);

  if (existingCheck.exists) {
    if (existingCheck.reason === "COURSE_CODE_EXISTS") {
      throw new HttpError(
        409,
        `Course with code "${courseCode}" already exists`,
      );
    }
    if (existingCheck.reason === "TITLE_EXISTS_IN_DEPARTMENT") {
      throw new HttpError(
        409,
        `Course "${title}" already exists in ${department} department. Consider enrolling in the existing course.`,
      );
    }
  }

  return await CourseRepo.createCourse(data);
};

const findExistingCourse = async (
  courseCode: string,
  title: string,
  department: string,
) => {
  // Check if course code already exists
  const existingByCode = await CourseRepo.findByCourseCode(courseCode);
  if (existingByCode) {
    return {
      exists: true,
      course: existingByCode,
      reason: "COURSE_CODE_EXISTS" as const,
    };
  }

  // Check if same title exists in same department
  const existingByTitle = await CourseRepo.findByTitleAndDepartment(
    title,
    department,
  );
  if (existingByTitle) {
    return {
      exists: true,
      course: existingByTitle,
      reason: "TITLE_EXISTS_IN_DEPARTMENT" as const,
    };
  }

  return { exists: false, course: null, reason: null };
};

const searchSimilarCourses = async (title: string, courseCode: string) => {
  const similarCourses = await CourseRepo.searchSimilarCourses(
    title,
    courseCode,
  );
  return similarCourses;
};

const checkBeforeCreate = async (data: CreateCourseInput) => {
  const { courseCode, title, department } = data;

  const existingCheck = await findExistingCourse(courseCode, title, department);
  const similarCourses = await searchSimilarCourses(title, courseCode);

  return {
    canCreate: !existingCheck.exists,
    existingCourse: existingCheck.course,
    reason: existingCheck.reason,
    similarCourses: similarCourses.filter(
      (c) => c.id !== existingCheck.course?.id,
    ),
  };
};

const getAllCourses = async () => {
  return await CourseRepo.findAllCourses();
};

const getCourseById = async (id: string) => {
  const course = await CourseRepo.getById(id);

  if (!course) {
    throw new HttpError(404, "Course not found");
  }

  return course;
};

const deleteCourse = async (id: string) => {
  const isExist = await CourseRepo.getById(id);

  if (!isExist) {
    throw new HttpError(404, "Course not found");
  }

  return await CourseRepo.deleteCourse(id);
};

export const CourseService = {
  createCourse,
  findExistingCourse,
  searchSimilarCourses,
  checkBeforeCreate,
  getAllCourses,
  getCourseById,
  deleteCourse,
};
