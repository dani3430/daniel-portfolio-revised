// Secure password hashing with scrypt (built into Node.js, no extra package needed).
// The stored text looks like: scrypt$cost$blockSize$parallel$salt$hash

import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

const KEY_LENGTH = 64
const COST = 16384
const BLOCK_SIZE = 8
const PARALLEL = 1

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLEL,
  })
  return ['scrypt', COST, BLOCK_SIZE, PARALLEL, salt.toString('base64'), key.toString('base64')].join('$')
}

// Returns true only if the password matches the stored hash
export async function verifyPassword(password, stored) {
  try {
    const [scheme, cost, blockSize, parallel, saltText, keyText] = stored.split('$')
    if (scheme !== 'scrypt') return false

    const salt = Buffer.from(saltText, 'base64')
    const expected = Buffer.from(keyText, 'base64')
    const key = await scryptAsync(password, salt, expected.length, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallel),
    })

    // timingSafeEqual compares in constant time, so response speed leaks nothing
    return key.length === expected.length && timingSafeEqual(key, expected)
  } catch {
    return false
  }
}