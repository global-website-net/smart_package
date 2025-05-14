import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const imagePath = path.join(process.cwd(), 'public', 'images', filename)
    
    if (!fs.existsSync(imagePath)) {
      return new NextResponse('Image not found', { status: 404 })
    }
    
    const imageBuffer = fs.readFileSync(imagePath)
    const contentType = getContentType(filename)
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    return new NextResponse('Error loading image', { status: 500 })
  }
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.png': return 'image/png'
    case '.jpg': case '.jpeg': return 'image/jpeg'
    case '.gif': return 'image/gif'
    case '.svg': return 'image/svg+xml'
    default: return 'application/octet-stream'
  }
} 