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

    const createdId = await knex
      .insert([{ date, title, status }], ["id"])
      .into("lessons");

    return createdId[0];
  }

  //TODO: create insert objects from teacherIds
  async createLessonTeacherRelation(lessondId, teacherIds) {
    const { knex } = this.app;
    const err = new Error();

    const objectsToInsert = teacherIds.map((el) => {
      return { lesson_id: lessondId, teacher_id: el };
    });

    const results = await knex
      .insert(objectsToInsert, ["teacher_id", "lesson_id"])
      .into("lesson_teachers");

    return true;
  }

  async createLessonsWithRelations(params) {
    const createdLessonsIds = [];

    const err = new Error();
    err.statusCode = 400;

    if (params.lessonsCount && params.lastDate) {
      err.message =
        "invalid request body: shouldn't be lessonsCount and lastDate at the same time";
      throw err;
    }

    if (params.lessonsCount && params.lessonsCount > 300) {
      err.message = "invalid request body: lessonsCount should be <300";
      throw err;
    }

    const firstDateFormatted = DateTime.fromISO(params.firstDate);
    const lastDateFormatted = params.lastDate
      ? DateTime.fromISO(params.lastDate)
      : null;

    if (params.lastDate) {
      const duration = lastDateFormatted.diff(
        firstDateFormatted,
        "hours"
      ).years;

      console.log("\nservice: checking duration - ", duration);
      if (duration > 1) {
        err.message =
          "invalid request body: difference between dates should be less than 1 year";
        throw err;
      }
    }

    let currentDate = firstDateFormatted;
    let i = 0;
    while (
      ((i < params.lessonsCount && params.lessonsCount) ||
        (lastDateFormatted && currentDate < lastDateFormatted)) &&
      i < 300 &&
      currentDate.diff(firstDateFormatted,"years").years < 1
    ) {
      console.log('WIP: ',currentDate.diff(firstDateFormatted,"years").years)
      if (params.days.includes(currentDate.weekday)) {
        let lessonId = await this.createLesson(
          currentDate.toISO(),
          params.title,
          true
        );
        i++;
        createdLessonsIds.push(lessonId.id);
        await this.createLessonTeacherRelation(lessonId.id, params.teacherIds);
      }
      currentDate = currentDate.plus({ day: 1 });
    }
    return createdLessonsIds;
  }
}

module.exports = {
  LessonsService,
};
