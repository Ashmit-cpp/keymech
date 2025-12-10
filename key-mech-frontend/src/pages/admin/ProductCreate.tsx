export default function AdminProductCreate() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product for your catalog</p>
      </div>

      <div className="p-6 border rounded-lg">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Select category</option>
                <option>Keyboards</option>
                <option>Switches</option>
                <option>Keycaps</option>
                <option>Accessories</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter SKU"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Product Images</label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Drag and drop images here or click to browse</p>
              <button type="button" className="mt-2 text-primary hover:underline">
                Browse Files
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="active" />
            <label htmlFor="active" className="text-sm">Product is active</label>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2 rounded"
            >
              Create Product
            </button>
            <button
              type="button"
              className="border px-6 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
