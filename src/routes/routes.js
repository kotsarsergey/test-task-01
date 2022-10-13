const LessonsService = require("../services/lessons-service").LessonsService;
const getLessonsValidation = require("../schemas/lesson.schema");

async function routes(fastify, options) {
  const lessonsService = new LessonsService(fastify);

  fastify.get("/", getLessonsValidation, async (request, reply) => {
    //const result = lessonsService.getAllLessons(request.query);
    const result = lessonsService.getFilteredLessons(request.query);
    return result;
  });
  fastify.post("/lessons", async (request, reply) => {
    return { fuck: "you" };
  });
}

module.exports = routes;
