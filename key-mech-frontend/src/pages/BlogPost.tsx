import { useParams } from 'react-router-dom'

export default function BlogPostPage() {
  const { slug } = useParams()

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Blog Post: {slug}</h1>
          <div className="text-muted-foreground">January 1, 2024 • 5 min read</div>
        </header>
        <div className="prose max-w-none">
          <p>
            This is the content of the blog post. It would contain detailed information
            about mechanical keyboards, switches, or other related topics.
          </p>
          <p>
            More content would follow here with paragraphs, images, and other elements
            that make up a complete blog post.
          </p>
        </div>
      </article>
    </div>
  )
}
