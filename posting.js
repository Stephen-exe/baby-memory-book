function getPostId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function showPost() {
  const id = getPostId();
  const posts = JSON.parse(localStorage.getItem('memoryPosts') || '[]');
  const post = posts.find(p => p.id == id);
  const container = document.getElementById('postContainer');
  if (!post) {
    container.innerHTML = '<p>Post not found.</p>';
    return;
  }
  container.innerHTML = `
        <div class="card">
          <div class="card-body">
            <p>${post.text}</p>
            ${post.mediaType === 'image' ? `<img src="${post.media}" class="img-fluid" alt="Memory Image">` : ''}
            ${post.mediaType === 'video' ? `<video controls class="w-100"><source src="${post.media}" type="video/mp4"></video>` : ''}
            <a href="index.html" class="btn btn-secondary mt-3">Back</a>
          </div>
        </div>
      `;
}
showPost();
