import React, { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PostProps {
  id: string;
  content: string;
  imageUrl: string;
  authorId: string;
  createdAt: any;
  likes: string[];
  comments: Array<{
    id: string;
    text: string;
    userId: string;
    createdAt: any;
  }>;
}

export default function Post({ id, content, imageUrl, authorId, createdAt, likes, comments }: PostProps) {
  const [author, setAuthor] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchAuthor = async () => {
      const authorDoc = await getDoc(doc(db, 'users', authorId));
      if (authorDoc.exists()) {
        setAuthor(authorDoc.data());
      }
    };
    fetchAuthor();
  }, [authorId]);

  useEffect(() => {
    setIsLiked(likes.includes(auth.currentUser?.uid || ''));
  }, [likes]);

  const handleLike = async () => {
    const postRef = doc(db, 'posts', id);
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    if (isLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(userId)
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(userId)
      });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const postRef = doc(db, 'posts', id);
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const comment = {
      id: Date.now().toString(),
      text: newComment,
      userId,
      createdAt: new Date().toISOString()
    };

    await updateDoc(postRef, {
      comments: arrayUnion(comment)
    });

    setNewComment('');
  };

  if (!author) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center mb-4">
        <Link to={`/profile/${authorId}`}>
          <img
            src={author.photoURL || 'https://via.placeholder.com/40'}
            alt={author.username}
            className="w-10 h-10 rounded-full mr-3"
          />
        </Link>
        <div>
          <Link
            to={`/profile/${authorId}`}
            className="font-semibold text-gray-900 hover:underline"
          >
            {author.username}
          </Link>
          <p className="text-gray-500 text-sm">
            {formatDistanceToNow(new Date(createdAt.toDate()), { addSuffix: true })}
          </p>
        </div>
      </div>

      <p className="text-gray-900 mb-4">{content}</p>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Post"
          className="rounded-lg mb-4 max-h-96 w-full object-cover"
        />
      )}

      <div className="flex items-center space-x-4 text-gray-500">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 ${
            isLiked ? 'text-red-500' : ''
          }`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likes.length}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{comments.length}</span>
        </button>
        <button className="flex items-center space-x-1">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {showComments && (
        <div className="mt-4">
          <form onSubmit={handleComment} className="mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-2">
                <img
                  src="https://via.placeholder.com/32"
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{comment.text}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}