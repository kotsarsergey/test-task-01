const LessonsService = require("../services/lessons-service").LessonsService;
const getLessonsValidation = require("../schemas/get-lessons-schema");
const createLessonsValidation = require("../schemas/create-lessons-schema");

async function routes(fastify, options) {
  const lessonsService = new LessonsService(fastify);

  fastify.get("/", getLessonsValidation, async (request, reply) => {
    const result = lessonsService.getFilteredLessons(request.query);
    return result;
  });

  //TODO: not catching error
  fastify.post("/lessons", createLessonsValidation, async (request, reply) => {
    const result = lessonsService.createLessonsWithRelations(request.body);
    return result;
  });
}

module.exports = routes;
