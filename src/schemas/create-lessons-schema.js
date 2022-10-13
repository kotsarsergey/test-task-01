const createLessonsValidation = {
  schema: {
    body: {
      type: "object",
      required: ["teacherIds", "title", "days", "firstDate"],
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
          items: { type: "number", minimum: 1, maximum: 7 },
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
