import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import type { NextConfig } from 'next'

function gitSha(): string {
  // Vercel không clone đủ history để chạy git, nhưng có sẵn biến này
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
  }
  try {
    return execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()
  } catch {
    return 'local'
  }
}

const pkgVersion = JSON.parse(readFileSync('./package.json', 'utf8')).version as string

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_VERSION: pkgVersion,
    NEXT_PUBLIC_BUILD_SHA: gitSha(),
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
}

export default nextConfig
