import React from "react";
import WalletConnectButton from "../components/WalletConnectButton";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        {user?.username ? `@${user.username}` : "Гость"}
      </h1>
      {user?.id && <p className="text-gray-400 mb-4">ID: {user.id}</p>}

      <WalletConnectButton />
    </div>
  );
};

export default Profile;
