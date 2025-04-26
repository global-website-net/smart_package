import EditBlogPostClient from './EditBlogPostClient'

type Props = {
  params: {
    id: string
  }
}

export default function EditPage({ params }: Props) {
  return <EditBlogPostClient id={params.id} />
} 