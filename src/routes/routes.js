const LessonsService = require("../services/lessons-service").LessonsService;
const getLessonsValidation = require("../schemas/get-lessons-schema");
const createLessonsValidation = require("../schemas/create-lessons-schema");

async function routes(fastify, options) {
  const lessonsService = new LessonsService(fastify);

  fastify.get("/", getLessonsValidation, async (request, reply) => {
    //const result = lessonsService.getAllLessons(request.query);
    const result = lessonsService.getFilteredLessons(request.query);
    return result;
  });
  fastify.post("/lessons",createLessonsValidation, async (request, reply) => {
    const result = lessonsService.createLessons(request.body);
    return true;
  });
}

module.exports = routes;
