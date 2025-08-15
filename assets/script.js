const form = document.getElementById('memoryForm');
const postsDiv = document.getElementById('memoryPosts');
const searchDateInput = document.getElementById('searchDate');
const clearSearchBtn = document.getElementById('clearSearch');

function formatDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function loadPosts(filterDate = null) {
  const posts = JSON.parse(localStorage.getItem('memoryPosts') || '[]');
  postsDiv.innerHTML = '';
  posts.slice().reverse().forEach((post, idx) => {
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
    postHtml += `<button class="btn btn-danger btn-sm mt-2 delete-post" data-index="${posts.length - 1 - idx}">Delete</button>`;
    postHtml += `</div></div>`;
    postsDiv.innerHTML += postHtml;
  });

  document.querySelectorAll('.delete-post').forEach(btn => {
    btn.addEventListener('click', function () {
      deletePost(parseInt(this.getAttribute('data-index')));
    });
  });
}

searchDateInput.addEventListener('change', function () {
  loadPosts(this.value);
});
clearSearchBtn.addEventListener('click', function () {
  searchDateInput.value = '';
  loadPosts();
});

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
      if (file.type.startsWith('image/')) {
        resizeImage(file).then(resizedDataUrl => {
          mediaArray.push({
            url: resizedDataUrl,
            type: 'image',
            fileType: 'image/jpeg'
          });
          filesProcessed++;
          if (filesProcessed === files.length) {
            savePost(text, mediaArray, submitBtn);
          }
        });
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = function (event) {
          mediaArray.push({
            url: event.target.result,
            type: 'video',
            fileType: file.type
          });
          filesProcessed++;
          if (filesProcessed === files.length) {
            savePost(text, mediaArray, submitBtn);
          }
        };
        reader.readAsDataURL(file);
      } else {
        filesProcessed++;
        if (filesProcessed === files.length) {
          savePost(text, mediaArray, submitBtn);
        }
      }
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

function deletePost(index) {
  const posts = JSON.parse(localStorage.getItem('memoryPosts') || '[]');
  posts.splice(index, 1);
  localStorage.setItem('memoryPosts', JSON.stringify(posts));
  loadPosts();
}

function resizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = function (e) {
      img.onload = function () {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

loadPosts()