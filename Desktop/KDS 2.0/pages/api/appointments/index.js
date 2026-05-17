import { readJson, appendToArray } from "../../../lib/githubStorage";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const json = await readJson("appointments.json");
      return res.status(200).json(json.data || []);
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const created = await appendToArray(
        "appointments.json",
        { ...body },
        "appointment_id",
        "Create appointment"
      );
      // octokit returns the entire file JSON; appendToArray returns the new JSON object
      // We return the last item as created entry
      const last = created.data[created.data.length - 1];
      return res.status(201).json(last);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
