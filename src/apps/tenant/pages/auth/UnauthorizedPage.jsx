/**
 * UnauthorizedPage.jsx — Shows when a user tries to access a page
 * their active role can't see.
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">403</h1>
      <p className="text-gray-500 mb-6">
        You don't have permission to view this page.
      </p>
      <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
    </div>
  );
}
