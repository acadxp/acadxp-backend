import prisma from "../../lib/db";
import type { StudentCourseEnrollment } from "../../generated/prisma/client";

const createCourseEnrollemnt = async (
  courseId: string,
  acadId: string,
): Promise<StudentCourseEnrollment> => {
  const courseEnrollment = await prisma.studentCourseEnrollment.create({
    data: {
      courseId,
      academicInfoId: acadId,
    },
  });

  return courseEnrollment;
};

const getCourseEnrollmentByAcadId = async (
  acadId: string,
): Promise<StudentCourseEnrollment[]> => {
  const courseEnrollments = await prisma.studentCourseEnrollment.findMany({
    where: {
      academicInfoId: acadId,
    },
    include: {
      course: true,
    },
  });

  return courseEnrollments;
};

const findExistingEnrollment = async (
  courseId: string,
  acadId: string,
): Promise<StudentCourseEnrollment | null> => {
  const existingEnrollment = await prisma.studentCourseEnrollment.findUnique({
    where: {
      academicInfoId_courseId: {
        academicInfoId: acadId,
        courseId,
      },
    },
  });

  return existingEnrollment;
};

const unEnrollFromCourse = async (courseId: string, acadId: string) => {
  const courseEnrollment = await prisma.studentCourseEnrollment.delete({
    where: {
      academicInfoId_courseId: {
        academicInfoId: acadId,
        courseId,
      },
    },
  });

  return courseEnrollment;
};

export const CourseEnrollmentRepo = {
  createCourseEnrollemnt,
  getCourseEnrollmentByAcadId,
  unEnrollFromCourse,
  findExistingEnrollment,
};
