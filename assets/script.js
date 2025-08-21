document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('memoryForm');
  const postsDiv = document.getElementById('memoryPosts');
  const searchDateInput = document.getElementById('searchDate');
  const clearSearchBtn = document.getElementById('clearSearch');

  // Formats a timestamp to a readable string
  function formatDateTime(ts) {
    const d = new Date(ts);
    return d.toLocaleString();
  }

  // Loads posts from localStorage, optionally filtering by date
  function loadPosts(filterDate = null) {
    const posts = JSON.parse(localStorage.getItem('memoryPosts') || '[]');
    // Gets posts from localStorage
    postsDiv.innerHTML = ''; // Clears current posts
    posts.slice().reverse().forEach((post, idx) => { // Loops through posts in reverse order
      const postDate = new Date(post.timestamp);
      if (filterDate) {
        const postDateStr = postDate.toISOString().slice(0, 10);
        const filterDateStr = new Date(filterDate).toISOString().slice(0, 10);
        if (postDateStr !== filterDateStr) {
          return; // Skips posts not matching filter date
        }
      }
      let postHtml = `<div class="card mb-3">
    <div class="card-body d-flex flex-column" style="max-width:570px; margin:auto;">
      <div>
        <div class="text-muted small mb-2">${formatDateTime(post.timestamp)}</div>
        <p>${post.text}</p>`;

      // Adds images/videos if present
      if (post.mediaArray && post.mediaArray.length > 0) {
        post.mediaArray.forEach(mediaObj => {
          if (mediaObj.type === 'image') {
            postHtml += `<img src="${mediaObj.url}" class="img-fluid mb-2" alt="Memory Image">`;
          } else if (mediaObj.type === 'video') {
            postHtml += `<video controls class="w-100 mb-2"><source src="${mediaObj.url}" type="${mediaObj.fileType}"></video>`;
          }
        });
      }
      postHtml += `</div>
      <button class="btn btn-danger btn-sm mt-auto delete-post" data-index="${posts.length - 1 - idx}">Delete</button>
    </div>
  </div>`;
      postsDiv.innerHTML += postHtml; // Adds post to DOM
    });

    // Adds delete event listeners to each delete button
    document.querySelectorAll('.delete-post').forEach(btn => {
      btn.addEventListener('click', function () {
        deletePost(parseInt(this.getAttribute('data-index')));
      });
    });
  }

  // Handles date filter change
  searchDateInput.addEventListener('change', function () {
    loadPosts(this.value);
  });

  // Handles clear filter button
  clearSearchBtn.addEventListener('click', function () {
    searchDateInput.value = '';
    loadPosts();
  });

  // Handles form submission for new memory
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevents default form submission
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true; // Disables button to prevent double submit

    const text = document.getElementById('memoryText').value; // Gets memory text
    const fileInput = document.getElementById('memoryMedia'); // Gets file input
    const files = Array.from(fileInput.files); // Gets selected files

    if (files.length > 0) {
      let mediaArray = [];
      let filesProcessed = 0;

      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          // Resizes image before saving
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
          // Reads video file as data URL
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
          // Skips unsupported file types
          filesProcessed++;
          if (filesProcessed === files.length) {
            savePost(text, mediaArray, submitBtn);
          }
        }
      });
    } else {
      // No files, just save text post
      savePost(text, [], submitBtn);
    }
  });

  // Saves a new post to localStorage and reloads posts
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
      form.reset(); // Resets form fields
      document.getElementById('memoryMedia').value = null; // Clears file input
      submitBtn.disabled = false; // Re-enables submit button
    }, 100);
  }

  // Deletes a post by index and reloads posts
  function deletePost(index) {
    const posts = JSON.parse(localStorage.getItem('memoryPosts') || '[]');
    posts.splice(index, 1);
    localStorage.setItem('memoryPosts', JSON.stringify(posts));
    loadPosts();
  }

  // Resizes an image file before saving
  function resizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = function (e) {
        img.onload = function () {
          let width = img.width;
          let height = img.height;

          // Adjusts width/height to fit within max dimensions
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }

          // Draws resized image on canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Returns resized image as data URL
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Loads posts on initial page load
  loadPosts()
});