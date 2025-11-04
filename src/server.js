const path = require('path')
const fastify = require('fastify')({ logger: true })
const fastifyStatic = require('@fastify/static')
const { getAllVideos } = require('./utils')

const currentDir = process.cwd()
fastify.register(fastifyStatic, {
  root: path.join(currentDir, '.'),
  prefix: '/videos/',
})

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../assets'),
  decorateReply: false,
  prefix: '/',
})

fastify.get('/api/videos', async function handler(request) {
  let dir = request.query.dir ?? path.sep
  const in_dir = request.query.in_dir
  const back = request.query.back

  if (in_dir) {
    dir = path.join(dir, in_dir)
  } else if (back) {
    dir = path.resolve(dir, '..')
  }

  const files = await getAllVideos(dir)

  return {
    files,
    dir,
  }
})

exports.start = async () => {
  try {
    await fastify.listen({ port: 8686 })
    console.log('Server running on http://localhost:8686')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}