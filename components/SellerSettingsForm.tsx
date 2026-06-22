"use client";

import { useActionState, useEffect, useState } from "react";
import { updateProfileAction, requestVerificationAction } from "@/app/actions/profile";

interface UserInfo {
  id: string;
  name: string;
  nim: string | null;
  email: string;
  role: string;
  faculty: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

interface VerificationRequest {
  id: string;
  userId: string;
  nim: string;
  ktmUrl: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SellerSettingsFormProps {
  user: UserInfo;
  request: VerificationRequest | null;
}

export default function SellerSettingsForm({ user, request }: SellerSettingsFormProps) {
  const [profileState, profileAction, isProfilePending] = useActionState(updateProfileAction, null);
  const [verificationState, verificationAction, isVerificationPending] = useActionState(requestVerificationAction, null);

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    if (profileState?.success) {
      setProfileSuccess(true);
      const timer = setTimeout(() => setProfileSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [profileState]);

  useEffect(() => {
    if (verificationState?.success) {
      setVerificationSuccess(true);
      const timer = setTimeout(() => setVerificationSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [verificationState]);

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* profile settings section */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 shadow-sm">
        <h3 className="font-title-lg text-body-lg font-bold text-on-surface mb-4">Informasi Toko / Pengguna</h3>

        {profileSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 text-emerald-800 rounded-lg text-sm flex items-center gap-2 border border-emerald-200">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="font-semibold">Profil berhasil diperbarui!</span>
          </div>
        )}

        {profileState?.error && (
          <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-lg text-sm flex items-center gap-2 border border-outline-variant/30">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span className="font-semibold">{profileState.error}</span>
          </div>
        )}

        <form action={profileAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="name">
                Nama Lengkap <span className="text-error">*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={user.name}
                type="text"
                className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${
                  profileState?.validationErrors?.name ? "border-error" : "border-outline-variant/50"
                }`}
              />
              {profileState?.validationErrors?.name && (
                <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {profileState.validationErrors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="faculty">
                Fakultas / Program Studi
              </label>
              <input
                id="faculty"
                name="faculty"
                defaultValue={user.faculty || ""}
                placeholder="Contoh: Teknik Informatika / FT"
                type="text"
                className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${
                  profileState?.validationErrors?.faculty ? "border-error" : "border-outline-variant/50"
                }`}
              />
              {profileState?.validationErrors?.faculty && (
                <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {profileState.validationErrors.faculty[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Email UMM (Tidak dapat diubah)
            </label>
            <input
              disabled
              defaultValue={user.email}
              type="email"
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface-variant cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="avatarUrl">
              URL Foto Profil
            </label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              defaultValue={user.avatarUrl || ""}
              placeholder="Masukkan link gambar eksternal"
              type="text"
              className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${
                profileState?.validationErrors?.avatarUrl ? "border-error" : "border-outline-variant/50"
              }`}
            />
            {profileState?.validationErrors?.avatarUrl && (
              <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">error</span>
                {profileState.validationErrors.avatarUrl[0]}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProfilePending}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isProfilePending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* verification request section */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 shadow-sm">
        <h3 className="font-title-lg text-body-lg font-bold text-on-surface mb-2">Verifikasi Identitas Mahasiswa UMM</h3>
        <p className="font-body-md text-xs text-on-surface-variant mb-6">
          Dengan memverifikasi NIM dan Kartu Tanda Mahasiswa (KTM) aktif, akun Anda akan mendapatkan lencana terverifikasi di samping nama profil, yang secara signifikan meningkatkan kepercayaan pembeli.
        </p>

        {verificationSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 text-emerald-800 rounded-lg text-sm flex items-center gap-2 border border-emerald-200">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="font-semibold">Pengajuan verifikasi berhasil dikirim!</span>
          </div>
        )}

        {verificationState?.error && (
          <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-lg text-sm flex items-center gap-2 border border-outline-variant/30">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span className="font-semibold">{verificationState.error}</span>
          </div>
        )}

        {request ? (
          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-on-surface-variant">Status Pengajuan Verifikasi Anda:</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    request.status === "PENDING"
                      ? "bg-surface-variant text-on-surface-variant"
                      : request.status === "VERIFIED"
                      ? "bg-tertiary-fixed text-on-tertiary-fixed"
                      : "bg-error-container text-on-error-container"
                  }`}
                >
                  {request.status}
                </span>
                <span className="text-xs font-bold text-on-surface">NIM: {request.nim}</span>
              </div>
            </div>

            {request.status === "PENDING" && (
              <p className="text-xs text-on-surface-variant max-w-[200px] text-right">
                Menunggu verifikasi admin (estimasi 1x24 jam kerja).
              </p>
            )}
            {request.status === "VERIFIED" && (
              <p className="text-xs text-green-600 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Akun Anda telah terverifikasi!
              </p>
            )}
          </div>
        ) : null}

        {(!request || request.status === "REJECTED") && (
          <form action={verificationAction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="nim">
                  Nomor Induk Mahasiswa (NIM) <span className="text-error">*</span>
                </label>
                <input
                  id="nim"
                  name="nim"
                  required
                  defaultValue={user.nim || ""}
                  placeholder="Masukkan NIM aktif Anda"
                  type="text"
                  className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${
                    verificationState?.validationErrors?.nim ? "border-error" : "border-outline-variant/50"
                  }`}
                />
                {verificationState?.validationErrors?.nim && (
                  <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {verificationState.validationErrors.nim[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="ktmUrl">
                  URL Foto Kartu Tanda Mahasiswa (KTM) <span className="text-error">*</span>
                </label>
                <input
                  id="ktmUrl"
                  name="ktmUrl"
                  required
                  placeholder="Masukkan link gambar upload KTM Anda"
                  type="text"
                  className={`w-full bg-surface border rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${
                    verificationState?.validationErrors?.ktmUrl ? "border-error" : "border-outline-variant/50"
                  }`}
                />
                {verificationState?.validationErrors?.ktmUrl && (
                  <p className="text-error text-xs mt-1 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {verificationState.validationErrors.ktmUrl[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerificationPending}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isVerificationPending ? "Memproses..." : "Ajukan Verifikasi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
