const path = require('path')
const fs = require('fs')

const videoExtensions = new Set(['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.rmvb', '.mpeg', '.mpg', '.webm', '.3gp'])

exports.getFileListByDirPath = function (dirpath) {
  const currentDirPath = path.join(process.cwd(), dirpath)
  return new Promise(resolve => {
    const stats = fs.statSync(currentDirPath)

    // Not a folder
    if (!stats?.isDirectory?.()) {
      return resolve([])
    }

    fs.readdir(currentDirPath, { withFileTypes: true }, (err, entries) => {

      // Folder does not exist
      if (err) {
        return resolve([])
      }

      let fileList = []

      entries.forEach(entry => {
        if (entry.isDirectory()) {
          // Filter hidden directories
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
