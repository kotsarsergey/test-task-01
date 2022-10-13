const moment = require("moment");

class LessonsService {
  constructor(app) {
    if (!app.ready) throw new Error(`can't get .ready from fastify app.`);
    this.app = app;

    const { knex } = this.app;

    if (!knex) {
      throw new Error("cant get .knex from fastify app.");
    }
  }

  async findStudentsForLesson(lessonId) {
    const { knex } = this.app;

    const students = await knex
      .select("students.*")
      .from("lesson_students")
      .join("students", function () {
        this.on("students.id", "=", "lesson_students.student_id");
      })
      .where("lesson_id", lessonId);

    return students;
  }

  async findTeachersForLesson(lessonId) {
    const { knex } = this.app;

    const students = await knex
      .select("teachers.*")
      .from("lesson_teachers")
      .join("teachers", function () {
        this.on("teachers.id", "=", "lesson_teachers.teacher_id");
      })
      .where("lesson_id", lessonId);

    return students;
  }

  async getFilteredLessons(params) {
    const { knex } = this.app;

    console.log(params);

    const dateFrom = params.date[0]
      ? params.date[0]
      : moment().add(-1, "month").toDate();
    const dateTo = params.date[1];

    const offset = (params.page - 1) * params.lessonsPerPage;

    let query = knex
      .select("l.id", "l.date", "l.title", "l.status")
      .count("l.id", { as: "studentsCount" })
      .from("lessons as l")
      .leftJoin("lesson_teachers as lt", "l.id", "lt.lesson_id")
      .leftJoin("lesson_students as ls", "l.id", "ls.lesson_id")
      .leftJoin("teachers as t", "lt.teacher_id", "t.id")
      .leftJoin("students as s", "ls.student_id", "s.id")
      .groupByRaw("l.id,l.date,l.title,l.status");

    if (dateTo) {
      query.where("date", ">=", dateFrom).andWhere("date", "<", dateTo);
    } else {
      query.where("date", "=", dateFrom);
    }

    if (params.teacherIds) {
      query.whereIn("t.id", params.teacherIds);
    }

    if (params.studentsCount) {
      query.havingRaw("count(l.id) > ?", params.studentsCount);
    }

    if (params.lessonsPerPage) {
      query.limit(params.lessonsPerPage);
    }

    if (params.page) {
      query.offset(offset);
    }

    const filteredList = await query;

    const result = await filteredList.reduce(async (acc, el, index) => {
      el.students = await this.findStudentsForLesson(el.id);
      el.teachers = await this.findTeachersForLesson(el.id);
      acc[index] = el;
      return acc;
    }, []);

    return result;
  }
}

module.exports = {
  LessonsService,
};
