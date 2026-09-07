/**
 * Creates (or resets) an admin account. Run with:
 *   npm run create-admin
 *
 * Prompts for an email and password interactively — never accepts
 * default or hardcoded credentials.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { getAdminByEmail, createAdmin } from "../src/lib/db/admins";
import { pool } from "../src/lib/db/pool";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Minimal, dependency-free hidden-input prompt for the password so it
// isn't echoed to the terminal.
async function promptHiddenPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    stdout.write(question);
    const onData = (char: Buffer) => {
      const str = char.toString("utf8");
      if (str === "\n" || str === "\r" || str === "\u0004") {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        stdout.write("\n");
        resolve(password);
      } else if (str === "\u0003") {
        process.exit(1);
      } else if (str === "\u007f") {
        password = password.slice(0, -1);
      } else {
        password += str;
      }
    };
    let password = "";
    stdin.resume();
    stdin.setRawMode?.(true);
    stdin.on("data", onData);
  });
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  console.log("Create the first Tunify admin account.\n");

  let email = "";
  while (!isValidEmail(email)) {
    email = (await rl.question("Admin email: ")).trim().toLowerCase();
    if (!isValidEmail(email)) {
      console.log("That doesn't look like a valid email address.");
    }
  }

  rl.close();

  let password = "";
  while (password.length < 10) {
    password = await promptHiddenPassword("Admin password (min 10 characters): ");
    if (password.length < 10) {
      console.log("Password must be at least 10 characters.");
    }
  }

  const confirm = await promptHiddenPassword("Confirm password: ");
  if (confirm !== password) {
    console.error("Passwords did not match. Run the command again.");
    process.exit(1);
  }

  const existing = await getAdminByEmail(email);
  if (existing) {
    console.error(`An admin with email "${email}" already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await createAdmin(email, passwordHash);

  console.log(`\nAdmin account created for ${email}.`);
  console.log("You can now log in at /admin/login.");
}

main()
  .catch((err) => {
    console.error("Failed to create admin:", err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
