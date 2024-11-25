const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  }, // 게시물 제목
  photo: { 
    type: String, 
    required: true 
  }, // 게시물 사진 URL
  tags: [{ 
    type: String 
  }], // 태그 배열
  content: { 
    type: String, 
    required: true 
  }, // 게시물 내용
  createdAt: { 
    type: Date, 
    default: Date.now 
  } // 게시물 생성 시간
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post; 
