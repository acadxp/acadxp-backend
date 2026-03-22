import { CourseEnrollmentRepo } from "../infra/repos/course-enrollement.repo";
import { CourseRepo } from "../infra/repos/course.repo";
import { academicInfosService } from "./academicInfos.services";
import { HttpError } from "../error/httpError";

const createCourseEnrollemnt = async (courseId: string, userId: string) => {
  // check the course exists
  const course = await CourseRepo.getById(courseId);

  if (!course) {
    throw new HttpError(404, "Course not found");
  }

  // get academic info for the user
  const acadInfo = await academicInfosService.getAcademicInfoByUserId(userId);

  const existingEnrollment = await CourseEnrollmentRepo.findExistingEnrollment(
    courseId,
    acadInfo.id,
  );

  if (existingEnrollment) {
    throw new HttpError(400, "You are already enrolled in this course");
  }

  const courseEnrollment = await CourseEnrollmentRepo.createCourseEnrollemnt(
    courseId,
    acadInfo.id,
  );

  if (!courseEnrollment) {
    throw new HttpError(500, "Failed to create course enrollment");
  }

  return courseEnrollment;
};

const getCourseEnrollmentByAcadId = async (userId: string) => {
  // get academic info for the user
  const acadInfo = await academicInfosService.getAcademicInfoByUserId(userId);

  const courseEnrollments =
    await CourseEnrollmentRepo.getCourseEnrollmentByAcadId(acadInfo.id);

  return courseEnrollments;
};

const unEnrollFromCourse = async (courseId: string, userId: string) => {
  // get academic info for the user
  const acadInfo = await academicInfosService.getAcademicInfoByUserId(userId);

  const courseEnrollment = await CourseEnrollmentRepo.unEnrollFromCourse(
    courseId,
    acadInfo.id,
  );

  if (!courseEnrollment) {
    throw new HttpError(500, "Failed to unenroll from course");
  }

  return courseEnrollment;
};

export const CourseEnrollmentService = {
  createCourseEnrollemnt,
  getCourseEnrollmentByAcadId,
  unEnrollFromCourse,
};
