const form = document.getElementById('memoryForm');
const postsDiv = document.getElementById('memoryPosts');
const searchDateInput = document.getElementById('searchDate');
const clearSearchBtn = document.getElementById('clearSearch');

// Format date/time
function formatDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

// Load and display posts from localStorage
function loadPosts(filterDate = null) {
  const posts = JSON.parse(localStorage.getItem('memoryPosts') || '[]');
  postsDiv.innerHTML = '';
  posts.slice().reverse().forEach(post => {
    const postDate = new Date(post.timestamp);
    if (filterDate) {
      const filter = new Date(filterDate);
      if (
        postDate.getFullYear() !== filter.getFullYear() ||
        postDate.getMonth() !== filter.getMonth() ||
        postDate.getDate() !== filter.getDate()
      ) {
        return;
      }
    }
    let postHtml = `<div class="card mb-3"><div class="card-body">
      <div class="text-muted small mb-2">${formatDateTime(post.timestamp)}</div>
      <p>${post.text}</p>`;
    if (post.mediaArray && post.mediaArray.length > 0) {
      post.mediaArray.forEach(mediaObj => {
        if (mediaObj.type === 'image') {
          postHtml += `<img src="${mediaObj.url}" class="img-fluid mb-2" alt="Memory Image">`;
        } else if (mediaObj.type === 'video') {
          postHtml += `<video controls class="w-100 mb-2"><source src="${mediaObj.url}" type="${mediaObj.fileType}"></video>`;
        }
      });
    }
    postHtml += `</div></div>`;
    postsDiv.innerHTML += postHtml;
  });
}

// Search by date
searchDateInput.addEventListener('change', function () {
  loadPosts(this.value);
});
clearSearchBtn.addEventListener('click', function () {
  searchDateInput.value = '';
  loadPosts();
});

// Handle form submit for multiple files
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  const text = document.getElementById('memoryText').value;
  const fileInput = document.getElementById('memoryMedia');
  const files = Array.from(fileInput.files);

  if (files.length > 0) {
    let mediaArray = [];
    let filesProcessed = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = function (event) {
        mediaArray.push({
          url: event.target.result,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          fileType: file.type
        });
        filesProcessed++;
        if (filesProcessed === files.length) {
          savePost(text, mediaArray, submitBtn);
        }
      };
      reader.readAsDataURL(file);
    });
  } else {
    savePost(text, [], submitBtn);
  }
});

function savePost(text, mediaArray, submitBtn) {
  const post = {
    text,
    mediaArray,
    timestamp: Date.now()
  };
  const posts = JSON.parse(localStorage.getItem('memoryPosts') || '[]');
  posts.push(post);
  localStorage.setItem('memoryPosts', JSON.stringify(posts));
  loadPosts();
  setTimeout(() => {
    form.reset();
    document.getElementById('memoryMedia').value = null;
    submitBtn.disabled = false;
  }, 100);
}
loadPosts()