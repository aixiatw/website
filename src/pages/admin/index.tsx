import { TinaAdmin } from "@tinacms/astro";

export default function AdminPage() {
  return (
    <TinaAdmin
      config={{
        configUrl: "/admin/tina-backend.json",
        useRelativeMediaActions: true,
      }}
    />
  );
}
