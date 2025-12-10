import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Home, Briefcase, MapPin, Plus, Pencil, Trash2 } from "lucide-react";

interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  type: "home" | "work" | "other";
  isDefault?: boolean;
}

const addresses: Address[] = [
  {
    id: "home",
    label: "Home",
    name: "John Doe",
    street: "123 Main Street",
    line2: "Apt 4B",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
    type: "home",
    isDefault: true,
  },
  {
    id: "work",
    label: "Work",
    name: "John Doe",
    street: "456 Business Ave",
    line2: "Suite 200",
    city: "New York",
    state: "NY",
    zip: "10002",
    country: "United States",
    type: "work",
  },
];

const typeIconMap: Record<Address["type"], React.ElementType> = {
  home: Home,
  work: Briefcase,
  other: MapPin,
};

export default function AccountAddresses() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Addresses</h1>
          <p className="text-muted-foreground">Manage your shipping and billing addresses</p>
        </div>
        <Button className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          Add new address
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => {
          const Icon = typeIconMap[address.type];
          return (
            <Card key={address.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base">{address.label} address</CardTitle>
                    <CardDescription>{address.type === "home" ? "Primary residence" : "Saved location"}</CardDescription>
                  </div>
                </div>
                {address.isDefault && <Badge>Default</Badge>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="text-foreground font-medium">{address.name}</p>
                  <p>{address.street}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p>{address.country}</p>
                </div>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <MapPin className="h-4 w-4" />
                    Set as default
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-1">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
