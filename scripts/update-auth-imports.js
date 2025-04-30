const fs = require('fs').promises
const path = require('path')

function calculateRelativePath(fromFile) {
  // Count the number of directories up from the current file to src/app/api
  const segments = fromFile.split('/')
  const apiIndex = segments.indexOf('api')
  const depth = segments.length - apiIndex - 2 // -2 for 'api' and the file itself
  
  // Create the relative path
  return '../'.repeat(depth) + 'auth/[...nextauth]/auth'
}

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
      const relativePath = calculateRelativePath(file)
      
      const updatedContent = content.replace(
        /import\s*{\s*authOptions\s*}\s*from\s*['"](\.\.\/)*auth\/\[\.\.\.nextauth\]\/auth['"]/g,
        `import { authOptions } from '${relativePath}'`
      ).replace(
        /import\s*{\s*authOptions\s*}\s*from\s*['"]@\/lib\/auth['"]/g,
        `import { authOptions } from '${relativePath}'`
      )
      
      await fs.writeFile(file, updatedContent, 'utf8')
      console.log(`Updated ${file} with relative path ${relativePath}`)
    } catch (error) {
      console.error(`Error updating ${file}:`, error)
    }
  }
}

updateImports().catch(console.error) 