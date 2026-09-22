import { notFound } from "next/navigation";
import { container } from "@/container/di";
import { WizardShell } from "@/components/wizard/WizardShell";
import { WizardTour } from "@/components/wizard/WizardTour";
import { WIZARD_CATALOG } from "@/wizard-catalog/wizardCatalog";

export default async function WizardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await container.getProjectBySlug.execute(slug);
  if (!project) notFound();

  if (project.isCompleted()) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">¡Ya enviaste tus respuestas!</h1>
        <p className="mt-2 text-slate-600">
          Gracias, {project.clientName}. Tu desarrollador ya tiene todo lo que necesita para arrancar.
        </p>
      </div>
    );
  }

  const answers = await container.getAnswersForProject.execute(project.id);

  return (
    <>
      <WizardTour />
      <WizardShell
        projectId={project.id}
        clientName={project.clientName}
        catalog={WIZARD_CATALOG}
        initialAnswers={answers.map((answer) => answer.toJSON())}
      />
    </>
  );
}
