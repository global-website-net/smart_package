const fs = require('fs').promises
const path = require('path')

async function updateImports() {
  const files = [
    'src/app/api/user/profile/route.ts',
    'src/app/api/user/delete/route.ts',
    'src/app/api/wallet/route.ts',
    'src/app/api/blog/route.ts',
    'src/app/api/blog/[id]/route.ts',
    'src/app/api/users/regular/route.ts',
    'src/app/api/blog/create/route.ts',
    'src/app/api/setup/route.ts',
    'src/app/api/auth/delete/route.ts',
    'src/app/api/auth/[...nextauth]/route.ts',
    'src/app/api/shops/route.ts',
    'src/app/api/packages/all/route.ts',
    'src/app/api/packages/create/route.ts',
    'src/app/api/packages/my-packages/route.ts',
    'src/app/api/packages/[id]/route.ts'
  ]

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf8')
      const updatedContent = content.replace(
        /import\s*{\s*authOptions\s*}\s*from\s*['"]@\/lib\/auth['"]/g,
        `import { authOptions } from '../auth/[...nextauth]/auth'`
      )
      await fs.writeFile(file, updatedContent, 'utf8')
      console.log(`Updated ${file}`)
    } catch (error) {
      console.error(`Error updating ${file}:`, error)
    }
  }
}

updateImports().catch(console.error) 