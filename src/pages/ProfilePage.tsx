import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const ProfilePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="text-muted-foreground hover:text-primary flex items-center gap-1.5 mb-6">
        <ChevronLeft className="h-5 w-5" />
        Back to Library
      </Link>
      <h1 className="text-4xl font-bold mb-6">User Profile</h1>
      <div className="space-y-4">
        <p className="text-lg">This page will display your user profile information.</p>
        <p className="text-muted-foreground">Features coming soon: Account details, reading history, saved preferences, etc.</p>
      </div>
    </div>
  );
};

export default ProfilePage; 