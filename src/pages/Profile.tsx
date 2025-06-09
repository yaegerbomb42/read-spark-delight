import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ProfilePage: React.FC = () => {
  const [name, setName] = useState('');
  const [picture, setPicture] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('profileName');
    const storedPic = localStorage.getItem('profilePicture');
    if (storedName) setName(storedName);
    if (storedPic) setPicture(storedPic);
  }, []);

  const saveProfile = () => {
    localStorage.setItem('profileName', name);
    if (picture) localStorage.setItem('profilePicture', picture);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPicture(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">Profile</h2>
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Picture</label>
        <Input type="file" accept="image/*" onChange={handleFileChange} />
        {picture && <img src={picture} alt="Profile" className="h-20 w-20 rounded-full object-cover" />}
      </div>
      <Button onClick={saveProfile}>Save Profile</Button>
    </div>
  );
};

export default ProfilePage;
