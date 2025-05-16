import { Router } from "express";
import { AppDataSource } from "../data-source";
import { WorkflowFactory } from "../workflows/WorkflowFactory";
import path from "path";

const router = Router();
const workflowFactory = new WorkflowFactory(AppDataSource);

router.post("/", async (req, res) => {
  const { clientId, geoJson, workflowName } = req.body;

  let workflowFile: string;

  if (!workflowName) {
    workflowFile = path.join(__dirname, "../workflows/example_workflow.yml");
  } else {
    workflowFile = path.join(__dirname, "../workflows", `${workflowName}.yml`);
  }

  try {
    const workflow = await workflowFactory.createWorkflowFromYAML(
      workflowFile,
      clientId,
      JSON.stringify(geoJson)
    );

    res.status(202).json({
      workflowId: workflow.workflowId,
      message: "Workflow created and tasks queued from YAML definition.",
    });
  } catch (error: any) {
    console.error("Error creating workflow:", error);
    res.status(500).json({ message: "Failed to create workflow" });
  }
});

export default router;
