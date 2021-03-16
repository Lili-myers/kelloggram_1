// /.netlify/functions/create_post
let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()
  let body = JSON.parse(event.body)
  let userId = body.userId
  let username = body.username
  let imageUrl = body.imageUrl
  //let projectId = body.project
  
  console.log(`user: ${userId}`)
  console.log(`imageUrl: ${imageUrl}`)

  let newPost = { 
    userId: userId,
    username: username, 
    imageUrl: imageUrl, 
    //project: projectId,
    created: firebase.firestore.FieldValue.serverTimestamp()
  }

  let docRef = await db.collection('projectposts').add(newPost)
  newPost.id = docRef.id
  newPost.ups = 0
  newPost.downs = 0

  return {
    statusCode: 200,
    body: JSON.stringify(newPost)
  }

}