// Background auto blur for immersion
document.addEventListener("scroll", () => {
  document.body.style.backgroundPositionY = `${window.scrollY * 0.5}px`;
});

// Office gallery preview
const upload = document.getElementById("upload");
if (upload) {
  upload.addEventListener("change", e => {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    [...e.target.files].forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = document.createElement("img");
        img.src = ev.target.result;
        img.style.width = "200px";
        img.style.margin = "10px";
        img.style.borderRadius = "10px";
        gallery.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
}
