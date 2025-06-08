// src/index.ts
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export {
  cn,
  formatDate,
  sleep
};
//# sourceMappingURL=index.mjs.map