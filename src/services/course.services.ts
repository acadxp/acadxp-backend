import { CourseRepo } from "../infra/repos/course.repo";
import type { CreateCourseInput } from "../validation/course.schema";
import { HttpError } from "../error/httpError";

const createCourse = async (data: CreateCourseInput) => {
  const existingCourse = await CourseRepo.findByCourseCode(data.courseCode);

  if (existingCourse) {
    throw new HttpError(
      400,
      `A course with code "${data.courseCode}" already exists`,
    );
  }

  const course = await CourseRepo.createCourse(data);

  return course;
};

const searchCourses = async (courseCode: string, title: string) => {
  const courses = await CourseRepo.searchSimilarCourses(title, courseCode);
  return {
    found: courses.length > 0,
    courses,
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
  searchCourses,
  getAllCourses,
  getCourseById,
  deleteCourse,
};
