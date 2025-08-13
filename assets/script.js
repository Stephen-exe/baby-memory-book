const form = document.getElementById('memoryForm');
const posts = document.getElementById('memoryPosts');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const text = document.getElementById('memoryText').value;
  const fileInput = document.getElementById('memoryMedia');
  const file = fileInput.files[0];

  let postHtml = `<div class="card mb-3"><div class="card-body"><p>${text}</p>`;

  if (file) {
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
      postHtml += `<img src="${url}" class="img-fluid" alt="Memory Image">`;
    } else if (file.type.startsWith('video/')) {
      postHtml += `<video controls class="w-100"><source src="${url}" type="${file.type}"></video>`;
    }
  }

  postHtml += `</div></div>`;
  posts.innerHTML = postHtml + posts.innerHTML;
  form.reset();
});