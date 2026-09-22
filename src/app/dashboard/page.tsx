import Link from "next/link";
import { container } from "@/container/di";
import { ProjectList } from "@/components/dashboard/ProjectList";

export default async function DashboardPage() {
  const projects = await container.listProjects.execute();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Tus proyectos</h1>

      {projects.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">Aún no tienes proyectos.</p>
          <Link
            href="/dashboard/new"
            className="ui-button ui-button-primary mt-4"
          >
            Crear el primero
          </Link>
        </div>
      ) : (
        <ProjectList projects={projects.map((project) => project.toJSON())} />
      )}
    </div>
  );
}
