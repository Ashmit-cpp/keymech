export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">About KeyMech</h1>
        <div className="space-y-6">
          <p className="text-lg text-muted-foreground">
            KeyMech is your premier destination for mechanical keyboards and accessories.
            We are passionate about providing high-quality products and exceptional customer service.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-muted-foreground">
                To provide enthusiasts with the best mechanical keyboard experience possible.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-muted-foreground">
                To become the leading online retailer for mechanical keyboard products worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
