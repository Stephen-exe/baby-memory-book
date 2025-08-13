const form = document.getElementById('memoryForm');
const postsDiv = document.getElementById('memoryPosts');

// Helper to format date/time
function formatDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

// Load and display posts from localStorage
function loadPosts() {
  const posts = JSON.parse(localStorage.getItem('memoryPosts') || '[]');
  postsDiv.innerHTML = '';
  posts.slice().reverse().forEach(post => {
    let postHtml = `<div class="card mb-3"><div class="card-body">
      <div class="text-muted small mb-2">${formatDateTime(post.timestamp)}</div>
      <p>${post.text}</p>`;
    if (post.media && post.mediaType === 'image') {
      postHtml += `<img src="${post.media}" class="img-fluid" alt="Memory Image">`;
    } else if (post.media && post.mediaType === 'video') {
      postHtml += `<video controls class="w-100"><source src="${post.media}" type="${post.mediaFileType}"></video>`;
    }
    postHtml += `</div></div>`;
    postsDiv.innerHTML += postHtml;
  });
}

// Save post to localStorage
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const text = document.getElementById('memoryText').value;
  const fileInput = document.getElementById('memoryMedia');
  const file = fileInput.files[0];

  let media = '';
  let mediaType = '';
  let mediaFileType = '';
  if (file) {
    mediaFileType = file.type;
    if (file.type.startsWith('image/')) {
      mediaType = 'image';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    }
  }

  // Read file as DataURL for persistence
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      media = event.target.result;
      savePost(text, media, mediaType, mediaFileType);
    };
    reader.readAsDataURL(file);
  } else {
    savePost(text, '', '', '');
  }
});

function savePost(text, media, mediaType, mediaFileType) {
  const post = {
    text,
    media,
    mediaType,
    mediaFileType,
    timestamp: Date.now()
  };
  const posts = JSON.parse(localStorage.getItem('memoryPosts') || '[]');
  posts.push(post);
  localStorage.setItem('memoryPosts', JSON.stringify(posts));
  loadPosts();
  form.reset();
}

// Initial load
loadPosts();