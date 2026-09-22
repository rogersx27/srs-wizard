import assert from "node:assert/strict";
import { test } from "node:test";
import { WIZARD_CATALOG } from "../src/wizard-catalog/wizardCatalog.ts";
import { collectAnswerNotes } from "../src/infrastructure/srs/answerNotes.ts";
import { SrsMarkdownTemplate } from "../src/infrastructure/srs/SrsMarkdownTemplate.ts";

const question = WIZARD_CATALOG.flatMap((section) => section.questions).find((item) => item.emptyAnswerLabel);
const declined = { questionId: question.id, valueText: question.emptyAnswerLabel, valueList: [] };
const input = {
  project: { clientName: "Prueba" },
  narrative: { introduction: "Proyecto de prueba", userDescription: "Equipo", aiDegraded: false },
  generatedAt: new Date("2026-09-22T12:00:00Z"),
  requirements: [],
};
const renderSystem = (answers, requirements = []) => {
  const markdown = new SrsMarkdownTemplate().render({ ...input, requirements, answerNotes: collectAnswerNotes(WIZARD_CATALOG, answers) });
  return markdown.split("## 4. Requisitos del Sistema\n")[1].split("## 5.")[0];
};

test("an explicit empty choice renders a formal note instead of unspecified or a requirement", () => {
  const system = renderSystem([declined]);
  assert.match(system, /El cliente indicó que por ahora no se requieren integraciones\./);
  assert.doesNotMatch(system, /No necesito|No especificado|RS-\d+/);
});

test("missing, arbitrary or contradictory answers cannot produce a note", () => {
  for (const answers of [
    [],
    [{ ...declined, valueText: "Un texto arbitrario" }],
    [{ ...declined, valueList: ["WhatsApp"] }],
    [{ ...declined, valueList: null }],
    [{ ...declined, valueText: null }],
  ]) {
    assert.deepEqual(collectAnswerNotes(WIZARD_CATALOG, answers), []);
    assert.match(renderSystem(answers), /No especificado/);
  }
});

test("notes follow catalog metadata even when a question ID changes", () => {
  const renamed = { ...question, id: "another-question" };
  const catalog = [{ questions: [renamed] }];
  assert.deepEqual(collectAnswerNotes(catalog, [{ ...declined, questionId: renamed.id }]), [
    { category: question.ieee830Category, text: question.emptyAnswerNote },
  ]);
});

test("a category note does not suppress other requirements or leak to another category", () => {
  const requirements = [{ id: "RS-001", text: "Otro requisito de sistema", priority: "ESSENTIAL", category: "SYSTEM" }];
  const markdown = new SrsMarkdownTemplate().render({ ...input, requirements, answerNotes: collectAnswerNotes(WIZARD_CATALOG, [declined]) });
  assert.match(markdown, /RS-001 \| Otro requisito de sistema \| Esencial/);
  assert.equal(markdown.split(question.emptyAnswerNote).length - 1, 1);
  assert.match(markdown.split("## 3. Requisitos de Usuario\n")[1].split("## 4.")[0], /No especificado/);
});
