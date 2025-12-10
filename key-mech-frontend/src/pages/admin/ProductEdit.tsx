import { useParams } from 'react-router-dom'

export default function AdminProductEdit() {
  const { productId } = useParams()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product information for #{productId}</p>
      </div>

      <div className="p-6 border rounded-lg">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                defaultValue="Keychron K8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select className="w-full px-3 py-2 border rounded-md" defaultValue="Keyboards">
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
              defaultValue="Wireless mechanical keyboard with hot-swappable switches"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border rounded-md"
                defaultValue="89.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md"
                defaultValue="45"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                defaultValue="KC-K8-WHT"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Product Images</label>
            <div className="grid grid-cols-4 gap-4">
              <div className="aspect-square bg-muted rounded-lg relative">
                <button className="absolute top-1 right-1 text-red-500 hover:text-red-700">
                  ×
                </button>
              </div>
              <div className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                <button type="button" className="text-primary hover:underline text-sm">
                  Add Image
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="active" defaultChecked />
            <label htmlFor="active" className="text-sm">Product is active</label>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2 rounded"
            >
              Update Product
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
