#!/usr/bin/env node
const fastify = require('fastify')({ logger: false })
const path = require('path')
const fs = require('fs')
const fastifyStatic = require('@fastify/static')

const currentDir = process.cwd()

const videoExtensions = new Set(['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.rmvb', '.mpeg', '.mpg', '.webm', '.3gp'])

fastify.register(fastifyStatic, {
  root: path.join(currentDir, '.'),
  prefix: '/videos/',
})

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'assets'),
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

// 启动服务
const start = async () => {
  try {
    await fastify.listen({ port: 8686 })
    console.log('Server running on http://localhost:8686')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()

function getAllVideos(dirpath) {
  const currentDirPath = path.join(currentDir, dirpath)
  return new Promise(resolve => {
    const stats = fs.statSync(currentDirPath)

    if (!stats?.isDirectory?.()) {
      return resolve([])
    }

    fs.readdir(currentDirPath, { withFileTypes: true }, (err, entries) => {
      if (err) {
        return resolve([])
      }
      let fileList = []

      entries.forEach(entry => {
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.')) {
            fileList.push({
              type: 'folder',
              name: entry.name,
              path: path.join(dirpath, entry.name),
            })
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (videoExtensions.has(ext)) {
            fileList.push({
              type: 'video',
              name: entry.name,
              path: path.join(dirpath, entry.name),
            })
          }
        }
      })
      resolve(fileList)
    })
  })
}
