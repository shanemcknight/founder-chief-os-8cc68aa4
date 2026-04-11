export function initTheme() {
  const stored = localStorage.getItem("mythos-theme");
  if (stored === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("mythos-theme", "dark");
  }
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("mythos-theme", isDark ? "dark" : "light");
  return isDark;
}
