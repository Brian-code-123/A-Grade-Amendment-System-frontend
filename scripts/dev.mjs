import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const backendRoot = resolve(frontendRoot, '../A-Grade-Amendment-System')
const viteBin = resolve(frontendRoot, 'node_modules/vite/bin/vite.js')

const children = []
let shuttingDown = false

function startProcess(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  })

  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    shuttingDown = true
    const reason = signal ? `signal ${signal}` : `code ${code}`
    console.error(`[${name}] exited with ${reason}`)
    stopAll()
    process.exit(code ?? 1)
  })

  children.push(child)
  return child
}

function stopAll() {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }
}

process.on('SIGINT', () => {
  shuttingDown = true
  stopAll()
  process.exit(130)
})

process.on('SIGTERM', () => {
  shuttingDown = true
  stopAll()
  process.exit(143)
})

startProcess('backend', 'npm', ['start'], backendRoot)
startProcess('frontend', process.execPath, [viteBin, '--logLevel', 'error'], frontendRoot)