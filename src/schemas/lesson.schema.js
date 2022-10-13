const getLessonsValidation = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        date: {
          type: "array",
          maxItems: 2,
          items: { type: "string" },
          default: ["2022-01-01"],
        },
        status: { type: "boolean" },
        teacherIds: {
          type: "array",
          items: { type: "number" },
        },
        studentsCount: {
          type: "array",
          maxItems: 2,
          items: { type: "number" },
        },
        page: { type: "number", default: 1 },
        lessonsPerPage: { type: "number", default: 5 },
      },
    },
  },
};

module.exports = getLessonsValidation;
