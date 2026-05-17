import { readJson, updateInArray, deleteFromArray } from "../../../lib/githubStorage";

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === "GET") {
      const json = await readJson("appointments.json");
      const item = (json.data || []).find((i) => String(i.appointment_id) === String(id));
      if (!item) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(item);
    }

    if (req.method === "PUT") {
      try {
        const updatedJson = await updateInArray(
          "appointments.json",
          (it) => String(it.appointment_id) === String(id),
          (existing) => ({ ...existing, ...req.body }),
          `Update appointment ${id}`
        );
        const item = (updatedJson.data || []).find((i) => String(i.appointment_id) === String(id));
        return res.status(200).json(item);
      } catch (err) {
        return res.status(404).json({ error: err.message });
      }
    }

    if (req.method === "DELETE") {
      await deleteFromArray(
        "appointments.json",
        (it) => String(it.appointment_id) === String(id),
        `Delete appointment ${id}`
      );
      return res.status(200).json({ message: "Deleted" });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
