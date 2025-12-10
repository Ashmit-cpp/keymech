import React from "react";
import { ShoppingCart, Eye } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface ProductCardProps {
  product: any; // direct API type
  onClick: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  let imageList: string[] = [];
  try {
    imageList = JSON.parse(product.images || "[]");
  } catch {
    imageList = [];
  }

  const price = `₹${(product.price / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  return (
    <Card
      className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-colors duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => onClick(product)}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={imageList[0] || "/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.status === "GROUP_BUY" && <Badge variant="secondary">Group Buy</Badge>}
          {product.status === "PREORDER" && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur text-foreground">
              Preorder
            </Badge>
          )}
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
          >
            <Eye className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 grow">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {(product.keyboardSpec || product.switchSpec || product.keycapSpec) && (
          <div className="flex items-center text-sm text-muted-foreground mb-3 mt-1">
            {product.keyboardSpec && <span className="mr-3">{product.keyboardSpec.layout}</span>}
            {product.switchSpec && <span className="mr-3">{product.switchSpec.switchType}</span>}
            {product.keycapSpec && <span className="mr-3">{product.keycapSpec.profile}</span>}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center mt-auto">
        <span className="text-xl font-bold text-foreground">{price}</span>

        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
