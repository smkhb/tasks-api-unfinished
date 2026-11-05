import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

let database = new Database();

export const routes = [
  
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: async (req, res) => {
      const { search } = req.query; 
      const tasks = database.select("tasks", search ? {
        title: search,
        description: search
      }: null);
      return res.end(JSON.stringify(tasks));
    }
  },
  
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: async (req, res) => {
      if (!req.body) {
        return res.writeHead(400).end();
      }
      const { title, description } = req.body;
      const task = {
        id: randomUUID(),
        title: title,
        description: description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      database.insert("tasks",task);
      return res.end(JSON.stringify(task));
    }
  },

  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: async(req, res) => {
      if (!req.body) {
        return res.writeHead(400).end();
      }
      const { id } = req.params;
      const { title, description } = req.body;
      database.update("tasks", id, { title, description });
      return res.writeHead(204).end();
    }
  },

  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: async (req, res) => {
      const { id } = req.params; 
      const tasks = database.delete("tasks", id);
      return res.end(JSON.stringify(tasks));
    }
  },

  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: async (req, res) => {
      const { id } = req.params; 
      const tasks = database.complete("tasks", id);
      return res.end(JSON.stringify(tasks));
    }
  }

]