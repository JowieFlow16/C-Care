import { Octokit } from "@octokit/rest";

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_REPO_OWNER;
const REPO = process.env.GITHUB_REPO_NAME;
const DATA_PATH = process.env.GITHUB_DATA_PATH || "data";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const MAX_RETRIES = Number(process.env.GITHUB_MAX_RETRIES || 4);
const RETRY_DELAY_MS = Number(process.env.GITHUB_RETRY_DELAY_MS || 300);

if (!TOKEN || !OWNER || !REPO) {
  throw new Error(
    "Missing GitHub environment variables (GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME)"
  );
}

const octokit = new Octokit({ auth: TOKEN });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getFileData(pathRelative) {
  const path = `${DATA_PATH}/${pathRelative}`;
  try {
    const res = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path, ref: BRANCH });
    if (!res || !res.data) return { json: { _version: "1.0", data: [] }, sha: null };
    const content = res.data.content || "";
    const sha = res.data.sha || null;
    const decoded = Buffer.from(content, "base64").toString("utf8");
    const parsed = decoded ? JSON.parse(decoded) : { _version: "1.0", data: [] };
    return { json: parsed, sha };
  } catch (err) {
    if (err.status === 404) return { json: { _version: "1.0", data: [] }, sha: null };
    throw err;
  }
}

async function putFileData(pathRelative, contentStr, sha, message) {
  const path = `${DATA_PATH}/${pathRelative}`;
  const encoded = Buffer.from(contentStr, "utf8").toString("base64");
  const params = { owner: OWNER, repo: REPO, path, message: message || `Update ${path}`, content: encoded, branch: BRANCH };
  if (sha) params.sha = sha;
  return octokit.repos.createOrUpdateFileContents(params);
}

async function modifyJsonFile(filePath, mutator, commitMessage) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const { json, sha } = await getFileData(filePath);
    const base = json && typeof json === "object" ? json : { _version: "1.0", data: [] };
    const copy = JSON.parse(JSON.stringify(base));
    const newJson = await mutator(copy);
    const contentStr = JSON.stringify(newJson, null, 2);
    try {
      await putFileData(filePath, contentStr, sha, commitMessage);
      return newJson;
    } catch (err) {
      // handle conflicts and retry
      if (err.status === 409 || err.status === 422) {
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
      }
      throw err;
    }
  }
  throw new Error("modifyJsonFile failed after retries");
}

export async function readJson(filePath) {
  const { json } = await getFileData(filePath);
  if (!json || typeof json !== "object") return { _version: "1.0", data: [] };
  return json;
}

export async function appendToArray(filePath, item, idKey = "id", commitMessage) {
  return modifyJsonFile(
    filePath,
    (current) => {
      current.data = current.data || [];
      if (idKey) {
        const maxId = current.data.reduce((m, it) => Math.max(m, Number(it[idKey] || 0)), 0);
        item[idKey] = Number(item[idKey] || maxId + 1);
      }
      current.data.push(item);
      return current;
    },
    commitMessage || `Add item to ${filePath}`
  );
}

export async function updateInArray(filePath, predicate, updater, commitMessage) {
  return modifyJsonFile(
    filePath,
    (current) => {
      current.data = current.data || [];
      const idx = current.data.findIndex(predicate);
      if (idx === -1) throw new Error("Item not found");
      current.data[idx] = { ...current.data[idx], ...updater(current.data[idx]) };
      return current;
    },
    commitMessage || `Update item in ${filePath}`
  );
}

export async function deleteFromArray(filePath, predicate, commitMessage) {
  return modifyJsonFile(
    filePath,
    (current) => {
      current.data = (current.data || []).filter((it) => !predicate(it));
      return current;
    },
    commitMessage || `Delete item from ${filePath}`
  );
}

export default {
  readJson,
  appendToArray,
  updateInArray,
  deleteFromArray,
};
