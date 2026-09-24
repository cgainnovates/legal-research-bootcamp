import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "registrations.json");

let writeQueue = Promise.resolve();

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readAll() {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(records) {
  await ensureFile();
  const tmp = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(records, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
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
    if (index === -1) return null;
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
    currency: record.currency,
    status: record.status,
    reference: record.reference,
    paidAt: record.paidAt || null,
    verified: record.status === "paid",
    createdAt: record.createdAt,
  };
}
