import EditBlogPostClient from './EditBlogPostClient'

interface PageProps {
  params: {
    id: string
  }
}

export default function EditBlogPostPage({ params }: PageProps) {
  return <EditBlogPostClient id={params.id} />
} 