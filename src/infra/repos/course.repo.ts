import prisma from "../../lib/db";
import type { Course } from "@prisma/client";

const createCourse = async (data: Course) => {
  const course = await prisma.course.create({
    data,
  });
  return course;
};

const findAllCourses = async () => {
  const courses = await prisma.course.findMany();
  return courses;
};

const findByCourseCode = async (courseCode: string) => {
  return await prisma.course.findUnique({
    where: { courseCode },
  });
};

const findByTitleAndDepartment = async (title: string, department: string) => {
  return await prisma.course.findFirst({
    where: {
      title: {
        equals: title,
        mode: "insensitive",
      },
      department: department as any,
    },
  });
};

const searchSimilarCourses = async (title: string, courseCode: string) => {
  return await prisma.course.findMany({
    where: {
      OR: [
        { courseCode },
        {
          title: {
            contains: title,
            mode: "insensitive",
          },
        },
      ],
    },
    take: 5,
  });
};

const getById = async (id: string) => {
  return await prisma.course.findUnique({
    where: { id },
  });
};

const deleteCourse = async (id: string) => {
  return await prisma.course.delete({
    where: { id },
  });
};

export const CourseRepo = {
  createCourse,
  findByCourseCode,
  findByTitleAndDepartment,
  searchSimilarCourses,
  findAllCourses,
  getById,
  deleteCourse,
};
