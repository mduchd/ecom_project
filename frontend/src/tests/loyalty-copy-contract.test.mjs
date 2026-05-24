import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const adminPage = fs.readFileSync(path.join(root, "src/pages/AdminDiemTichLuyPage.jsx"), "utf8");
const app = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");

for (const label of [
  "Điểm tích lũy",
  "Lịch sử điểm",
  "Cộng điểm",
  "Trừ điểm",
  "Lý do điều chỉnh",
  "Cấu hình quy đổi",
]) {
  assert.ok(adminPage.includes(label) || app.includes(label), `Thiếu nhãn tiếng Việt: ${label}`);
}

assert.ok(!adminPage.includes("Loyalty"), "UI admin không được hiển thị chữ Loyalty.");
assert.ok(!adminPage.includes("Reward"), "UI admin không được hiển thị chữ Reward.");
