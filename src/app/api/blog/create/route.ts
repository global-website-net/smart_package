const { data: blog, error } = await supabase
  .from('BlogPost')
  .insert([
    {
      title: title,
      content: content,
      author_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ])
  .select()
  .single()

if (error) {
  console.error('Error creating blog:', error)
  return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء المقال' }, { status: 500 })
} 