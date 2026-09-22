import { z } from "zod";

export const answerBodySchema = z.object({
  projectId: z.string().min(1),
  questionId: z.string().min(1),
  valueText: z.string().nullable().optional(),
  valueList: z.array(z.string()).nullable().optional(),
  priority: z.enum(["ESSENTIAL", "CONDITIONAL", "OPTIONAL"]).nullable().optional(),
  itemPriorities: z.array(z.enum(["ESSENTIAL", "CONDITIONAL", "OPTIONAL"]).nullable()).nullable().optional(),
}).refine((body) => !body.itemPriorities || body.itemPriorities.length === (body.valueList?.length ?? 0), {
  message: "Cada elemento debe tener su propia prioridad.",
});
