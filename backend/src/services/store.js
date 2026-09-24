import fs from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.VERCEL || process.env.NOW_REGION
  ? path.join(os.tmpdir(), "bootcamp-data")
  : path.resolve(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "registrations.json");

let writeQueue = Promise.resolve();
let memory = [];

async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(memory, null, 2), "utf8");
    } catch {
      // Read-only environments keep records in memory only.
    }
  }
}

async function readAll() {
  try {
    await ensureFile();
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memory = parsed;
      return parsed;
    }
  } catch {
    // fall through to memory
  }
  return memory;
}

async function writeAll(records) {
  memory = records;
  try {
    await ensureFile();
    const tmp = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(records, null, 2), "utf8");
    await fs.rename(tmp, DATA_FILE);
  } catch (error) {
    console.warn("[store] persistent write skipped:", error.message);
  }
}

function queued(fn) {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function createRegistration(record) {
  return queued(async () => {
    const records = await readAll();
    records.push(record);
    await writeAll(records);
    return record;
  });
}

export async function findByReference(reference) {
  const records = await readAll();
  return records.find((item) => item.reference === reference) || null;
}

export async function findById(id) {
  const records = await readAll();
  return records.find((item) => item.id === id) || null;
}

export async function updateByReference(reference, patch) {
  return queued(async () => {
    const records = await readAll();
    const index = records.findIndex((item) => item.reference === reference);
    if (index === -1) {
      const created = {
        reference,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      records.push(created);
      await writeAll(records);
      return created;
    }
    records[index] = { ...records[index], ...patch, updatedAt: new Date().toISOString() };
    await writeAll(records);
    return records[index];
  });
}

export function publicRegistration(record) {
  if (!record) return null;
  return {
    id: record.id,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    categoryId: record.categoryId,
    categoryLabel: record.categoryLabel,
    typeId: record.typeId,
    typeLabel: record.typeLabel,
    amountNaira: record.amountNaira,
    currency: record.currency || "NGN",
    status: record.status,
    reference: record.reference,
    paidAt: record.paidAt || null,
    verified: record.status === "paid",
    createdAt: record.createdAt,
  };
}
