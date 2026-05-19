import { CourseRepo } from "../infra/repos/course.repo";
import { academicInfosService } from "./academicInfos.services";
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

const getChallenge = async (courseId: string, challengeId: string, userId: string) => {
  const course = await CourseRepo.getById(courseId);
  if (!course) throw new HttpError(404, "Course not found");

  const acadInfo = await academicInfosService.getAcademicInfoByUserId(userId);
  const challenge = await CourseRepo.getChallengeById(challengeId, acadInfo.id);
  if (!challenge) throw new HttpError(404, "Challenge not found");

  const studentChallenge = challenge.students[0] ?? null;
  const { students, ...rest } = challenge;

  return {
    ...rest,
    progress: studentChallenge?.progress ?? 0,
    status: studentChallenge?.status ?? "NOT_STARTED",
    attempts: studentChallenge?.attempts ?? 0,
    completedAt: studentChallenge?.completedAt ?? null,
  };
};

const getChallenges = async (courseId: string, userId: string) => {
  const course = await CourseRepo.getById(courseId);
  if (!course) throw new HttpError(404, "Course not found");

  const acadInfo = await academicInfosService.getAcademicInfoByUserId(userId);
  const courseChallenges = await CourseRepo.getChallengesByCourseId(courseId, acadInfo.id);

  return courseChallenges.map((cc) => {
    const { students, ...challenge } = cc.challenge;
    const studentChallenge = students[0] ?? null;
    return {
      ...challenge,
      courseChallengeId: cc.id,
      isRequired: cc.isRequired,
      order: cc.order,
      progress: studentChallenge?.progress ?? 0,
      status: studentChallenge?.status ?? "NOT_STARTED",
      attempts: studentChallenge?.attempts ?? 0,
    };
  });
};

export const CourseService = {
  createCourse,
  searchCourses,
  getAllCourses,
  getCourseById,
  deleteCourse,
  getChallenge,
  getChallenges,
};
