"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import type { User } from "@prisma/client";
import { updateUser, deleteUser } from "@/app/actions/admin";

interface UserTableClientProps {
  users: User[];
  currentAdminId: string;
}

export default function UserTableClient({ users, currentAdminId }: UserTableClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const [state, formAction, isPendingSave] = useActionState(updateUser, null);

  
  useEffect(() => {
    if (state?.success) {
      setIsEditOpen(false);
      setSelectedUser(null);
    }
  }, [state]);

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      (u.nim && u.nim.toLowerCase().includes(query)) ||
      u.email.toLowerCase().includes(query)
    );
  });

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleBlockClick = (userId: string) => {
    if (confirm("Apakah Anda yakin ingin memblokir/menghapus pengguna ini?")) {
      startDeleteTransition(async () => {
        const response = await deleteUser(userId);
        if (response?.error) {
          alert(response.error);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NIM, atau email UMM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50"
          />
        </div>
        <div className="text-xs text-on-surface-variant font-semibold bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/20">
          Total: {filteredUsers.length} pengguna
        </div>
      </div>

      
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30 font-bold">
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">NIM</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Fakultas</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status Verifikasi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-on-surface-variant text-sm font-semibold">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-primary">{u.name}</td>
                    <td className="py-3 px-4 text-xs font-semibold">{u.nim || "-"}</td>
                    <td className="py-3 px-4 text-xs">{u.email}</td>
                    <td className="py-3 px-4 text-xs text-on-surface-variant">{u.faculty || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === "ADMIN"
                          ? "bg-primary text-on-primary"
                          : u.role === "SELLER"
                          ? "bg-secondary text-on-secondary"
                          : "bg-surface-container text-on-surface-variant"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-y-1">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold inline-flex items-center gap-0.5 w-fit ${
                          u.isVerified ? "text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded" : "text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded"
                        }`}>
                          <span className="material-symbols-outlined text-[12px] font-bold">
                            {u.isVerified ? "verified" : "pending"}
                          </span>
                          KTM: {u.isVerified ? "OK" : "Belum"}
                        </span>
                        <span className={`text-[10px] font-bold inline-flex items-center gap-0.5 w-fit ${
                          u.isEmailVerified ? "text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded" : "text-error bg-error-container/20 px-1.5 py-0.5 rounded"
                        }`}>
                          <span className="material-symbols-outlined text-[12px] font-bold">
                            {u.isEmailVerified ? "mail" : "drafts"}
                          </span>
                          Email: {u.isEmailVerified ? "OK" : "Belum"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded hover:bg-secondary hover:text-on-secondary transition-colors text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          Edit
                        </button>
                        
                        {u.id !== currentAdminId && u.role !== "ADMIN" && (
                          <button
                            onClick={() => handleBlockClick(u.id)}
                            disabled={isPendingDelete}
                            className="px-3 py-1 bg-error-container text-error rounded hover:bg-error hover:text-on-error transition-colors text-xs font-bold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">block</span>
                            Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[4px]"
            onClick={() => {
              setIsEditOpen(false);
              setSelectedUser(null);
            }}
          />

          {/* Modal Container */}
          <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30 z-10 flex flex-col max-h-[90vh]">
            <header className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                Edit Data Pengguna
              </h3>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedUser(null);
                }}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <form action={formAction} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <input type="hidden" name="id" value={selectedUser.id} />

              {state?.error && (
                <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm flex items-center gap-2 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{state.error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedUser.name}
                  required
                  className="w-full bg-surface border border-outline-variant text-on-surface text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                {state?.validationErrors?.name && (
                  <p className="text-error text-xs mt-1 font-semibold">{state.validationErrors.name[0]}</p>
                )}
              </div>

              {/* Email & NIM grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                    Email Resmi UMM
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedUser.email}
                    required
                    className="w-full bg-surface border border-outline-variant text-on-surface text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  {state?.validationErrors?.email && (
                    <p className="text-error text-xs mt-1 font-semibold">{state.validationErrors.email[0]}</p>
                  )}
                </div>

                {/* NIM */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                    NIM
                  </label>
                  <input
                    type="text"
                    name="nim"
                    defaultValue={selectedUser.nim || ""}
                    required
                    className="w-full bg-surface border border-outline-variant text-on-surface text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  {state?.validationErrors?.nim && (
                    <p className="text-error text-xs mt-1 font-semibold">{state.validationErrors.nim[0]}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                  Password Baru <span className="text-xs text-on-surface-variant font-normal">(Kosongkan jika tidak diubah)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Masukkan password baru jika ingin diubah"
                  className="w-full bg-surface border border-outline-variant text-on-surface text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/40"
                />
                {state?.validationErrors?.password && (
                  <p className="text-error text-xs mt-1 font-semibold">{state.validationErrors.password[0]}</p>
                )}
              </div>

              {/* Role & Faculty grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                    Peran (Role)
                  </label>
                  <select
                    name="role"
                    defaultValue={selectedUser.role}
                    className="w-full bg-surface border border-outline-variant text-on-surface text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  >
                    <option value="BUYER">BUYER</option>
                    <option value="SELLER">SELLER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  {state?.validationErrors?.role && (
                    <p className="text-error text-xs mt-1 font-semibold">{state.validationErrors.role[0]}</p>
                  )}
                </div>

                {/* Faculty */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                    Fakultas
                  </label>
                  <input
                    type="text"
                    name="faculty"
                    defaultValue={selectedUser.faculty || ""}
                    placeholder="Contoh: Teknik"
                    className="w-full bg-surface border border-outline-variant text-on-surface text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/40"
                  />
                  {state?.validationErrors?.faculty && (
                    <p className="text-error text-xs mt-1 font-semibold">{state.validationErrors.faculty[0]}</p>
                  )}
                </div>
              </div>

              {/* Verification Toggles */}
              <div className="pt-2 space-y-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/15">
                <span className="block font-label-md text-sm text-on-surface font-semibold">
                  Status Verifikasi Akun:
                </span>
                
                {/* isVerified (KTM) */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-on-surface">Verifikasi KTM (Mahasiswa)</span>
                    <span className="text-xs text-on-surface-variant">Menampilkan lencana centang biru di profil</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isVerified"
                      value="true"
                      defaultChecked={selectedUser.isVerified}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-focus:ring-1 peer-focus:ring-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* isEmailVerified */}
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-on-surface">Verifikasi Email UMM</span>
                    <span className="text-xs text-on-surface-variant">Mengizinkan pengguna login ke sistem</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isEmailVerified"
                      value="true"
                      defaultChecked={selectedUser.isEmailVerified}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-focus:ring-1 peer-focus:ring-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-outline text-on-surface hover:bg-surface-container-low transition-colors text-sm font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPendingSave}
                  className="px-5 py-2.5 bg-primary text-on-primary hover:bg-primary-container transition-colors rounded-lg text-sm font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isPendingSave ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
