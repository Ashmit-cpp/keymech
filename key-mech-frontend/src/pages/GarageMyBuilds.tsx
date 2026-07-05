import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getGarageControllerFindMeQueryKey,
  useGarageControllerFindMe,
  useGarageControllerRemove,
} from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { formatINR } from "@/lib/orders";

export default function GarageMyBuildsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useGarageControllerFindMe();
  const removeBuild = useGarageControllerRemove({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGarageControllerFindMeQueryKey(),
        });
        toast.success("Garage build deleted");
      },
    },
  });
  const builds = data?.data ?? [];

  return (
    <div className="min-h-screen bg-background pt-20 pb-10">
      <div className="container mx-auto max-w-5xl px-4">
        <header className="mb-6 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              [Garage]
            </p>
            <h1 className="font-serif text-4xl font-bold uppercase leading-none md:text-6xl">
              My Builds
            </h1>
          </div>
          <Button asChild>
            <Link to="/garage">New Build</Link>
          </Button>
        </header>

        {isLoading ? (
          <LoadingState label="Loading builds..." />
        ) : error ? (
          <Card className="rounded-none">
            <CardContent className="p-6 text-destructive">
              Failed to load Garage builds.
            </CardContent>
          </Card>
        ) : builds.length === 0 ? (
          <Card className="rounded-none">
            <CardContent className="p-6 text-muted-foreground">
              No Garage builds saved yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {builds.map((build) => (
              <Card key={build.id} className="rounded-none shadow-none">
                <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-semibold">
                        {build.name}
                      </h2>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        {build.layout}
                      </span>
                      {build.isPublic ? (
                        <span className="text-xs uppercase tracking-widest text-emerald-600">
                          Public
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatINR(build.totalPrice)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/garage/builds/${build.id}`}>
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/garage?buildId=${build.id}`}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={removeBuild.status === "pending"}
                      onClick={() => removeBuild.mutate({ id: build.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
