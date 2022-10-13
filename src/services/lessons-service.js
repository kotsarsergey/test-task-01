const DateTime = require("luxon").DateTime;

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
      : DateTime.now().plus({ month: -1 }).toJSDate();
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

  async createLesson(date, title, status) {
    const { knex } = this.app;

    const query = await knex
      .insert([{ date, title, status }], ["id"])
      .into("lessons");

    const createdId = await query;

    return createdId;
  }

  //TODO: create insert objects from teacherIds 
  async createLessonTeacherRelation(lessondId, teacherIds) {
    const { knex } = this.app;

    const query = await knex.insert([{ date, title }], ["id"]).into("lessons");

    const createdId = await query;

    return createdId;
  }

  async createLessonsWithRelations(params) {
    const { knex } = this.app;
    const createdLessonsIds = [];

    if (params.lessonsCount && params.lastDate) {
      throw new Error(
        "invalid request body: shouldn't be lessonsCount and lastDate at the same time"
      );
    }

    if (params.lessonsCount && params.lessonsCount > 300) {
      throw new Error("invalid request body: lessonsCount should be <300");
    }

    const firstDateFormatted = DateTime.fromISO(params.firstDate);

    if (params.lastDate) {
      const lastDateFormatted = DateTime.fromISO(params.lastDate);
      const duration = lastDateFormatted.diff(
        firstDateFormatted,
        "hours"
      ).hours;

      console.log("\nservice: checking duration - ", duration);
      if (duration > 1) {
        throw new Error(
          "invalid request body: shouldn't be lessonsCount and lastDate at the same time"
        );
      }
    }

    //strategy: lessonsCount
    if (params.lessonsCount) {
      let currentDate = firstDateFormatted;
      let i = 0;
      while (i < params.lessonsCount && i < 300)
        if (params.days.includes(currentDate.weekday)) {
          let lessonId = this.createLesson(
            currentDate.toISO(),
            params.title,
            true
          );
          this.createLessonTeacherRelation(lessonId,params.teacherIds)
        }
        createdLessonsIds.push(lessonId);
      currentDate = currentDate.plus({ day: 1 });
    }

    return createdLessonsIds;
  }
}

module.exports = {
  LessonsService,
};
