(() => {
    const userTheme = localStorage.getItem("theme");
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
    if (userTheme === "dark" || (!userTheme && prefersDarkMode)) {
      document.documentElement.classList.add("dark");
      document.documentElement.dataset.theme = "dark";
    }
  })();
  