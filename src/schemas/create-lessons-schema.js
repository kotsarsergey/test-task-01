const createLessonsValidation = {
  schema: {
    body: {
      type: "object",
      properties: {
        teacherIds: {
          type: "array",
          items: { type: "number" },
        },
        title: {
          type: "string",
        },
        days: {
          type: "array",
          items: { type: "number" },
        },
        firstDate: {
          type: "string",
          format: "date",
        },
        lastDate: {
          type: "string",
          format: "date",
        },
        lessonsCount: { type: "number" },
      },
    },
  },
};

module.exports = createLessonsValidation;
