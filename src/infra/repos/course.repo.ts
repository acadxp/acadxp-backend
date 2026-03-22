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

const searchSimilarCourses = async (title: string, courseCode: string) => {
  return await prisma.course.findMany({
    where: {
      OR: [
        { courseCode: { equals: courseCode, mode: "insensitive" } },
        {
          title: {
            contains: title,
            mode: "insensitive",
          },
        },
      ],
    },
    take: 5,
    orderBy: { createdAt: "desc" },
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
  searchSimilarCourses,
  findAllCourses,
  getById,
  deleteCourse,
};
