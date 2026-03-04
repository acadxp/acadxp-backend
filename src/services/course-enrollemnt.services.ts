import { CourseEnrollmentRepo } from "../infra/repos/course-enrollement.repo";
import { academicInfosService } from "./academicInfos.services";
import { HttpError } from "../error/httpError";

const createCourseEnrollemnt = async (courseId: string, userId: string) => {
  // get academic info for the user
  const acadInfo = await academicInfosService.getAcademicInfoByUserId(userId);

  const courseEnrollment = await CourseEnrollmentRepo.createCourseEnrollemnt(
    courseId,
    acadInfo.id,
  );

  if (!courseEnrollment) {
    throw new HttpError(500, "Failed to create course enrollment");
  }

  return courseEnrollment;
};

export const CourseEnrollmentService = { createCourseEnrollemnt };
