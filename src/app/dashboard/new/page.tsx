import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-slate-900">Nuevo proyecto</h1>
      <p className="mt-1 text-sm text-slate-500">
        Crea un proyecto por cada cliente. Te daremos un enlace único para enviarle.
      </p>
      <div className="mt-6">
        <CreateProjectForm />
      </div>
    </div>
  );
}
