import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Wrench } from "lucide-react";
import { toast } from "sonner";
import {
  getCartControllerGetCartQueryKey,
  useCartControllerAddGarageBuild,
  useGarageControllerFindOne,
  useProductsControllerFindAll,
  type ProductResponseDto,
} from "@/api/generated";
import GltfKeyboardViewer from "@/components/gltf-keyboard-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { GARAGE_SLOTS, getGarageSelections, getGarageTheme } from "@/lib/garage";
import { formatINR } from "@/lib/orders";
import { useAuthStore } from "@/stores/auth-store";

export default function GarageBuildDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading, error } = useGarageControllerFindOne(id, {
    query: { enabled: Boolean(id) },
  });
  const addGarageBuild = useCartControllerAddGarageBuild();

  const caseQuery = useProductsControllerFindAll({
    search: "",
    category: "KEYBOARD",
  });
  const pcbQuery = useProductsControllerFindAll({ search: "", category: "PCB" });
  const plateQuery = useProductsControllerFindAll({
    search: "",
    category: "PLATE",
  });
  const switchQuery = useProductsControllerFindAll({
    search: "",
    category: "SWITCH",
  });
  const keycapQuery = useProductsControllerFindAll({
    search: "",
    category: "KEYCAP",
  });
  const stabilizerQuery = useProductsControllerFindAll({
    search: "",
    category: "STABILIZER",
  });

  const build = data?.data;
  const theme = getGarageTheme(build?.theme);
  const selections = getGarageSelections(build?.selections);
  const selectedProducts = useMemo(() => {
    const productsBySlot = {
      case: caseQuery.data?.data ?? [],
      pcb: pcbQuery.data?.data ?? [],
      plate: plateQuery.data?.data ?? [],
      switches: switchQuery.data?.data ?? [],
      keycaps: keycapQuery.data?.data ?? [],
      stabilizers: stabilizerQuery.data?.data ?? [],
    };

    return Object.fromEntries(
      GARAGE_SLOTS.map(({ id: slot }) => {
        const products = productsBySlot[slot];
        const selection = selections[slot];
        const product = products.find(
          (item: ProductResponseDto) => item.id === selection.productId,
        );
        const variant = product?.variants.find(
          (item) => item.id === selection.variantId,
        );
        return [slot, { product, variant }];
      }),
    );
  }, [
    caseQuery.data?.data,
    keycapQuery.data?.data,
    pcbQuery.data?.data,
    plateQuery.data?.data,
    selections,
    stabilizerQuery.data?.data,
    switchQuery.data?.data,
  ]);

  async function addToCart() {
    if (!id) return;
    if (!isAuthenticated) {
      toast.info("Please sign in to add this build to cart");
      navigate("/auth/login");
      return;
    }
    await addGarageBuild.mutateAsync({ data: { garageBuildId: id, quantity: 1 } });
    await queryClient.invalidateQueries({
      queryKey: getCartControllerGetCartQueryKey(),
    });
    toast.success("Garage bundle added to cart");
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <LoadingState label="Loading Garage build..." />
      </div>
    );
  }

  if (error || !build) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Card className="rounded-none">
          <CardContent className="p-6 text-muted-foreground">
            Garage build not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-10">
      <div className="container mx-auto max-w-6xl px-4">
        <header className="mb-6 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              [Garage Build]
            </p>
            <h1 className="font-serif text-4xl font-bold uppercase leading-none md:text-6xl">
              {build.name}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {build.layout} layout · {formatINR(build.totalPrice)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/garage?buildId=${build.id}`}>
                <Wrench className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button onClick={addToCart} disabled={addGarageBuild.status === "pending"}>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-h-[520px] overflow-hidden border border-border">
            <GltfKeyboardViewer
              embedded
              garageKeycapTheme={theme}
              isInteractive
              isHeroKeyboardInView={false}
            />
          </div>
          <Card className="rounded-none shadow-none">
            <CardHeader>
              <CardTitle>Parts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {GARAGE_SLOTS.map(({ id: slot, label }) => {
                const { product, variant } = selectedProducts[slot] as {
                  product?: ProductResponseDto;
                  variant?: { name: string };
                };
                return (
                  <div key={slot} className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="max-w-[210px] text-right font-medium">
                      {product
                        ? `${product.name}${variant ? ` / ${variant.name}` : ""}`
                        : "Unavailable"}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
