import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Workflow } from "../models/Workflow";

const router = Router();

router.get("/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;

  AppDataSource.getRepository(Workflow)
    .findOne({
      where: { workflowId: id },
      relations: ["tasks"],
    })
    .then((workflow) => {
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      const totalTasks = workflow.tasks.length;
      const completedTasks = workflow.tasks.filter(
        (t) => t.status === "completed"
      ).length;

      res.json({
        workflowId: workflow.workflowId,
        status: workflow.status,
        completedTasks,
        totalTasks,
      });
    })
    .catch((error) => {
      console.error("Error fetching workflow status:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/:id/results", (req: Request, res: Response) => {
  const { id } = req.params;

  AppDataSource.getRepository(Workflow)
    .findOne({
      where: { workflowId: id },
    })
    .then((workflow) => {
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      if (workflow.status !== "completed") {
        return res.status(400).json({ message: "Workflow not completed yet" });
      }

      res.json({
        workflowId: workflow.workflowId,
        status: workflow.status,
        finalResult: workflow.finalResult,
      });
    })
    .catch((error) => {
      console.error("Error fetching workflow result:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

export default router;
