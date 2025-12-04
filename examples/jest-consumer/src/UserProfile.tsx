import React from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

export interface UserProfileProps {
  user: User;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function UserProfile({ user, onEdit, onDelete }: UserProfileProps) {
  return (
    <div data-testid="user-profile">
      <h2 data-testid="user-name">{user.name}</h2>
      <p data-testid="user-email">{user.email}</p>
      <p data-testid="user-role">Role: {user.role}</p>
      <div>
        {onEdit && (
          <button onClick={onEdit} data-testid="edit-button">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} data-testid="delete-button">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
