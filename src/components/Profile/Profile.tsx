import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db, storage } from '../../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Edit2, UserPlus, UserMinus } from 'lucide-react';
import PostList from '../Feed/PostList';

export default function Profile() {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUser(userDoc.data());
        setNewUsername(userDoc.data().username);
        setIsFollowing(userDoc.data().followers?.includes(currentUser?.uid));
      }
    };
    fetchUser();
  }, [userId, currentUser?.uid]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUser) return;

    const file = e.target.files[0];
    const imageRef = ref(storage, `profiles/${currentUser.uid}`);
    
    try {
      await uploadBytes(imageRef, file);
      const photoURL = await getDownloadURL(imageRef);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL
      });
      
      setUser((prev: any) => ({ ...prev, photoURL }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!currentUser || !newUsername.trim()) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        username: newUsername
      });
      
      setUser((prev: any) => ({ ...prev, username: newUsername }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !userId) return;

    const userRef = doc(db, 'users', userId);
    const currentUserRef = doc(db, 'users', currentUser.uid);

    try {
      if (isFollowing) {
        await updateDoc(userRef, {
          followers: arrayRemove(currentUser.uid)
        });
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId)
        });
      } else {
        await updateDoc(userRef, {
          followers: arrayUnion(currentUser.uid)
        });
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId)
        });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={user.photoURL || 'https://via.placeholder.com/100'}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover"
            />
            {currentUser?.uid === userId && (
              <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer">
                <Camera className="h-4 w-4 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              ) : (
                <h1 className="text-2xl font-bold">{user.username}</h1>
              )}
              {currentUser?.uid === userId && (
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleUsernameUpdate();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="text-blue-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-2 flex space-x-4 text-gray-600">
              <span>{user.followers?.length || 0} followers</span>
              <span>{user.following?.length || 0} following</span>
            </div>
            {currentUser?.uid !== userId && (
              <button
                onClick={handleFollow}
                className={`mt-2 flex items-center space-x-1 px-4 py-2 rounded-lg ${
                  isFollowing
                    ? 'bg-gray-200 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4" />
                    <span>Unfollow</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        <PostList userId={userId} />
      </div>
    </div>
  );
}