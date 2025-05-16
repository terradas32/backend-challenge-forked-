import { Job } from "./Job";
import { Task } from "../models/Task";
import { AppDataSource } from "../data-source";
import { Workflow } from "../models/Workflow";
import { TaskStatus } from "../workers/taskRunner";

export class ReportGenerationJob implements Job {
  async run(task: Task): Promise<void> {
    try {
      const workflow = await AppDataSource.getRepository(Workflow).findOne({
        where: { workflowId: task.workflowId },
        relations: ["tasks"],
      });

      if (!workflow) {
        throw new Error("Workflow not found for report generation.");
      }

      const report = {
        workflowId: workflow.workflowId,
        tasks: workflow.tasks.map((t) => ({
          taskId: t.taskId,
          type: t.taskType,
          status: t.status,
          output: t.output ? JSON.parse(t.output) : null,
        })),
        finalReport: "Aggregated data and results",
      };

      const reportJson = JSON.stringify(report, null, 2);

      // Guardar en el task actual
      task.output = reportJson;

      // Guardar en el workflow
      workflow.finalResult = reportJson;

      task.status = TaskStatus.Completed;

      await AppDataSource.getRepository(Workflow).save(workflow);
    } catch (error) {
      task.status = TaskStatus.Failed;
      task.output = JSON.stringify({
        error: (error as Error).message,
      });
    }
  }
}
