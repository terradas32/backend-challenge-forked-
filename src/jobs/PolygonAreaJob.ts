import { Job } from "./Job";
import { Task } from "../models/Task";
import area from "@turf/area";
import { Feature, Polygon, MultiPolygon } from "geojson";
import { TaskStatus } from "../workers/taskRunner";

export class PolygonAreaJob implements Job {
  async run(task: Task): Promise<void> {
    try {
      const geoJson = JSON.parse(task.geoJson) as Feature<
        Polygon | MultiPolygon
      >;

      if (
        !geoJson ||
        !geoJson.geometry ||
        geoJson.geometry.type !== "Polygon"
      ) {
        throw new Error("Invalid GeoJSON polygon data.");
      }

      const calculatedArea = area(geoJson);

      task.output = JSON.stringify({
        area: calculatedArea,
        unit: "square meters",
      });

      task.status = TaskStatus.Completed;
    } catch (error) {
      task.status = TaskStatus.Failed;
      task.output = JSON.stringify({
        error: (error as Error).message,
      });
    }
  }
}
