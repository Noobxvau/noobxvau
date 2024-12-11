import React from 'react';
import CreatePost from './CreatePost';
import PostList from './PostList';

export default function Feed() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <CreatePost />
      <PostList />
    </div>
  );
}