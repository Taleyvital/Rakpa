import routes from "@/data/routes.json";

type RouteItem = {
  id: string;
  title: string;
  subtitle: string;
  badge: string | null;
  icon: string;
  price: string;
  priceOld: string | null;
  duration: string;
  frequency: string;
  from: string;
  to: string;
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const route = (routes as RouteItem[]).find((r) => r.id === id);

  if (!route) {
    return (
      <div className="min-h-screen bg-background text-on-background pt-24 px-6 max-w-2xl mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">
          Itinéraire introuvable
        </h1>
        <p className="text-on-surface-variant text-sm font-medium tracking-wide">
          L'itinéraire demandé n'existe pas.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background pt-24 px-6 max-w-2xl mx-auto w-full">
      <h1 className="text-[3.5rem] font-bold leading-[1.1] tracking-tighter text-primary mb-4">
        {route.title}
      </h1>
      <p className="text-on-surface-variant text-body-md max-w-xs leading-relaxed">
        {route.subtitle}
      </p>

      <div className="mt-10 bg-surface-container-lowest rounded-lg p-8 flex flex-col gap-6 border border-outline-variant/5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white">
                {route.icon}
              </span>
            </div>
            <div>
              <h3 className="text-title-md font-bold">{route.from}</h3>
              <p className="text-label-sm text-outline tracking-wider uppercase">
                Départ
              </p>
            </div>
          </div>
          {route.badge ? (
            <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              {route.badge}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">schedule</span>
          <span className="text-body-md font-medium">{route.duration}</span>
          <span className="mx-2 text-outline-variant text-xs">•</span>
          <span className="text-body-md">{route.frequency}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[2.5rem] font-black tracking-tight">{route.price}</span>
          {route.priceOld ? (
            <span className="text-outline text-body-md line-through">{route.priceOld}</span>
          ) : null}
        </div>

        <div className="pt-6 mt-2 border-t border-outline-variant/10 flex items-center justify-between">
          <span className="text-body-md font-semibold">{route.from}</span>
          <span className="material-symbols-outlined text-outline text-xs">
            arrow_forward
          </span>
          <span className="text-body-md font-semibold">{route.to}</span>
        </div>
      </div>
    </div>
  );
}
