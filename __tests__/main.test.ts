import {expect, test} from '@jest/globals'
import * as cp from 'node:child_process'
import * as path from 'node:path'
import * as process from 'node:process'
import {fileURLToPath} from 'node:url'

// Calculate __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test('test runs', () => {
  process.env['INPUT_ACTION'] = 'code-review'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
