
firebase.auth().onAuthStateChanged(async function(user) {
  if (user) {
    // Signed in
    console.log('signed in')
     // Ensure the signed-in user is in the users collection
//    db.collection('users').doc(user.uid).set({
  //    name: user.displayName,
    //  email: user.email
    //})
    // Sign-out button
    document.querySelector('.sign-in-or-sign-out').innerHTML = `
      <button class="text-pink-500 underline sign-out">Sign Out</button>
    `
    document.querySelector('.sign-out').addEventListener('click', function(event) {
      console.log('sign out clicked')
      firebase.auth().signOut()
      document.location.href = 'index.html'
    })

    // Listen for the form submit and create/render the new post
    document.querySelector('form').addEventListener('submit', async function(event) {
      event.preventDefault()
      let postUsername = user.displayName
      let postImageUrl = document.querySelector('#image-url').value
      let response = await fetch('/.netlify/functions/create_project_post', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.uid,
          username: postUsername,
          imageUrl: postImageUrl
        })
      })
      let post = await response.json()
      document.querySelector('#image-url').value = '' // clear the image url field
      renderPost(post)
    })

    let response = await fetch('/.netlify/functions/get_posts')
    let posts = await response.json()
    for (let i=0; i<posts.length; i++) {
      let post = posts[i]
      renderPost(post)
    }

   /*  // On the projects HTML page, listen for the form submit and create/render the new post
    document.querySelector('form').addEventListener('submit', async function(event) {
      event.preventDefault()
      let postUsername = user.displayName
      let postImageUrl = document.querySelector('#image-url').value
      let response = await fetch('/.netlify/functions/create_project_post', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.uid,
          username: postUsername,
          imageUrl: postImageUrl
        })
      })
      let post = await response.json()
      document.querySelector('#image-url').value = '' // clear the image url field
      renderPost(post)
    })

    let response = await fetch('/.netlify/functions/get_project_posts')
    let posts = await response.json()
    for (let i=0; i<posts.length; i++) {
      let post = posts[i]
      renderPost(post)
    } */

  } else {
    // Signed out
    console.log('signed out')

    // Hide the form when signed-out
    document.querySelector('form').classList.add('hidden')

    // Initializes FirebaseUI Auth
    let ui = new firebaseui.auth.AuthUI(firebase.auth())

    // FirebaseUI configuration
    let authUIConfig = {
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl: 'index.html'
    }

    // Starts FirebaseUI Auth
    ui.start('.sign-in-or-sign-out', authUIConfig)
  }
})

// given a single post Object, render the HTML and attach event listeners
// expects an Object that looks similar to:
// {
//   id: 'abcdefg',
//   username: 'brian',
//   imageUrl: 'https://images.unsplash.com/...',
//   likes: 12,
//   comments: [
//     { username: 'brian', text: 'i love tacos!' },
//     { username: 'ben', text: 'fake news' }
//   ]
// }
async function renderPost(post) {
  let postId = post.id
  document.querySelector('.posts').insertAdjacentHTML('beforeend', `
    <div class="post-${postId} md:mt-16 mt-8 space-y-8">
      <div class="md:mx-0 mx-4">
        <span class="font-bold text-xl">Designer ${post.username}</span>
      </div>

      <div>
        <img src="${post.imageUrl}" class="w-full">
      </div>

      <div class="text-2xl md:mx-0 mx-4">
           <button class="up-button"><img src="http://www.pngmart.com/files/10/Thumbs-UP-PNG-Transparent-Image.png" width="20" height="20" border="0" alt="javascript button"></button>
            <span class="ups">${post.ups}</span>
      
            <button class="down-button"><img src="https://www.nicepng.com/png/detail/223-2238128_thumbs-down-emoji-discord-emoji-thumbs-down.png" width="20" height="20" border="0" alt="javascript button"></button>
            <span class="downs">${post.downs}</span>     
      </div>

      <div class="comments text-sm md:mx-0 mx-4 space-y-2">
        ${renderComments(post.comments)}
      </div>

      <div class="w-full md:mx-0 mx-4">
        ${renderCommentForm()}
      </div>
    </div>
  `)
    // listen for the up button on this post
  let upButton = document.querySelector(`.post-${post.id} .up-button`)
  upButton.addEventListener('click', async function(event) {
    event.preventDefault()
    console.log(`post ${post.id} up button clicked!`)
    let currentUserId = firebase.auth().currentUser.uid

    let response = await fetch('/.netlify/functions/up', {
      method: 'POST',
      body: JSON.stringify({
        postId: post.id,
        userId: currentUserId
      })
    })
    console.log(response.ok)
    if (response.ok) {
      console.log(response.ok)
      let existingNumberOfUps = document.querySelector(`.post-${post.id} .ups`).innerHTML
      console.log(existingNumberOfUps)
      let newNumberOfUps = parseInt(existingNumberOfUps) + 1
       console.log(newNumberOfUps)
      document.querySelector(`.post-${post.id} .ups`).innerHTML = newNumberOfUps

    }
  })


      // listen for the down button on this post
  let downButton = document.querySelector(`.post-${post.id} .down-button`)
  downButton.addEventListener('click', async function(event) {
    event.preventDefault()
    console.log(`post ${post.id} down button clicked!`)
    let currentUserId = firebase.auth().currentUser.uid

    let response = await fetch('/.netlify/functions/down', {
      method: 'POST',
      body: JSON.stringify({
        postId: post.id,
        userId: currentUserId
      })
    })
    if (response.ok) {
      let existingNumberOfDowns = document.querySelector(`.post-${post.id} .downs`).innerHTML
      console.log(existingNumberOfDowns)
      let newNumberOfDowns = parseInt(existingNumberOfDowns) + 1
      console.log(newNumberOfDowns)
      document.querySelector(`.post-${post.id} .downs`).innerHTML = newNumberOfDowns
    }
  })

  // listen for the post comment button on this post
  let postCommentButton = document.querySelector(`.post-${postId} .post-comment-button`)
  postCommentButton.addEventListener('click', async function(event) {
    event.preventDefault()
    console.log(`post ${postId} post comment button clicked!`)

    // get the text of the comment
    let postCommentInput = document.querySelector(`.post-${postId} input`)
    let newCommentText = postCommentInput.value
    console.log(`comment: ${newCommentText}`)

    // create a new Object to hold the comment's data
    let newComment = {
      postId: postId,
      username: firebase.auth().currentUser.displayName,
      text: newCommentText
    }

    // call our back-end lambda using the new comment's data
    await fetch('/.netlify/functions/create_comment', {
      method: 'POST',
      body: JSON.stringify(newComment)
    })

    // insert the new comment into the DOM, in the div with the class name "comments", for this post
    let commentsElement = document.querySelector(`.post-${postId} .comments`)
    commentsElement.insertAdjacentHTML('beforeend', renderComment(newComment))

    // clears the comment input
    postCommentInput.value = ''
  })
}

// given an Array of comment Objects, loop and return the HTML for the comments
function renderComments(comments) {
  if (comments) {
    let markup = ''
    for (let i = 0; i < comments.length; i++) {
      markup += renderComment(comments[i])
    }
    return markup
  } else {
    return ''
  }
}

// return the HTML for one comment, given a single comment Object
function renderComment(comment) {
  return `<div><strong>${comment.username}</strong> ${comment.text}</div>`
}

// return the HTML for the new comment form
function renderCommentForm() {
  let commentForm = ''
  commentForm = `
    <input type="text" class="mr-2 rounded-lg border px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="Add a comment...">
    <button class="post-comment-button py-2 px-4 rounded-md shadow-sm font-medium text-white bg-purple-600 focus:outline-none">Post</button>
  `
  return commentForm
}
