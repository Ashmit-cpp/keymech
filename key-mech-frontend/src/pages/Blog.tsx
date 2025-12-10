export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Blog posts will be rendered here */}
        <article className="p-6 border rounded-lg">
          <div className="aspect-video bg-muted rounded mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Blog Post Title</h3>
          <p className="text-muted-foreground mb-4">
            A brief description of the blog post content...
          </p>
          <div className="text-sm text-muted-foreground">January 1, 2024</div>
        </article>
      </div>
    </div>
  )
}
