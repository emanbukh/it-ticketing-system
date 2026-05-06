"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteUserAction, bulkDeleteUsersAction } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";
import { useActionState } from "react";

const USERS_PER_PAGE = 10;

interface User {
  id: string;
  name: string;
  staffId: string | null;
  email: string | null;
  role: string;
  googleId: string | null;
  createdAt: Date;
}

function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Delete User?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkDeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  count,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Delete {count} Users?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete <strong>{count}</strong> selected users? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Delete All
          </button>
        </div>
      </div>
    </div>
  );
}

export function UsersTable({ 
  users, 
  currentPage, 
  totalPages, 
  editId,
  basePath,
}: { 
  users: User[]; 
  currentPage: number; 
  totalPages: number; 
  editId: string | null;
  basePath: string;
}) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: string | null; userName: string }>({
    isOpen: false,
    userId: null,
    userName: "",
  });
  const [bulkDeleteModal, setBulkDeleteModal] = useState({ isOpen: false });
  const [deleteState, deleteAction] = useActionState(deleteUserAction, { success: false, message: "" });
  const [bulkDeleteState, bulkDeleteAction] = useActionState(bulkDeleteUsersAction, { success: false, message: "" });
  const [isPending, startTransition] = useTransition();

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const confirmDelete = () => {
    if (deleteModal.userId) {
      const formData = new FormData();
      formData.append("userId", deleteModal.userId);
      startTransition(() => {
        deleteAction(formData);
        setDeleteModal({ isOpen: false, userId: null, userName: "" });
      });
    }
  };

  const handleBulkDelete = () => {
    setBulkDeleteModal({ isOpen: true });
  };

  const confirmBulkDelete = () => {
    startTransition(() => {
      const formData = new FormData();
      selectedUsers.forEach((id) => formData.append("userIds[]", id));
      bulkDeleteAction(formData);
      setBulkDeleteModal({ isOpen: false });
      setSelectedUsers(new Set());
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    if (editId) params.set("edit", editId);
    window.history.pushState({}, "", `${basePath}?${params.toString()}`);
  };

  const handleEdit = (id: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("edit", id);
    if (currentPage > 1) params.set("page", String(currentPage));
    window.history.pushState({}, "", `${basePath}?${params.toString()}`);
  };

  const startIndex = (currentPage - 1) * USERS_PER_PAGE;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {selectedUsers.size} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
              disabled={isPending}
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedUsers(new Set())}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">
                <Checkbox
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 font-medium text-slate-700">#</th>
              <th className="px-4 py-3 font-medium text-slate-700">Name</th>
              <th className="px-4 py-3 font-medium text-slate-700">Staff ID</th>
              <th className="px-4 py-3 font-medium text-slate-700">Email</th>
              <th className="px-4 py-3 font-medium text-slate-700">Login Method</th>
              <th className="px-4 py-3 font-medium text-slate-700">Joined</th>
              <th className="px-4 py-3 font-medium text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 ${editId === user.id ? "bg-blue-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => toggleSelectUser(user.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{user.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-600">{user.staffId || "-"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">{user.email || "-"}</span>
                      {user.googleId && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Google
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={user.googleId ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"}>
                      {user.googleId ? "OAuth" : "Manual"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No users found. Create the first user above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-600">
            Showing {startIndex + 1}-{Math.min(startIndex + USERS_PER_PAGE, users.length)} of {users.length} users
          </p>
          <div className="flex gap-2">
            {currentPage > 1 ? (
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Previous
              </button>
            ) : (
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400">
                Previous
              </span>
            )}

            {currentPage < totalPages ? (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Next
              </button>
            ) : (
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400">
                Next
              </span>
            )}
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: "" })}
        onConfirm={confirmDelete}
        userName={deleteModal.userName}
      />

      <BulkDeleteConfirmationModal
        isOpen={bulkDeleteModal.isOpen}
        onClose={() => setBulkDeleteModal({ isOpen: false })}
        onConfirm={confirmBulkDelete}
        count={selectedUsers.size}
      />
    </>
  );
}
