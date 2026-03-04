import prisma from "../../lib/db";
import type { CourseEnrollment } from "@prisma/client";

const createCourseEnrollemnt = async (
  courseId: string,
  acadId: string,
): Promise<CourseEnrollment> => {
  const courseEnrollment = await prisma.studentCourseEnrollment.create({
    data: {
      courseId,
      academicInfoId: acadId,
    },
  });

  return courseEnrollment;
};

export const CourseEnrollmentRepo = { createCourseEnrollemnt };
